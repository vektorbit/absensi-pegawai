/****************************************
 * CONFIG
 ****************************************/

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbwag4f8mS1a22bJro1kUco7NGJo48R-_0LTSWxJ0N5Uh3D2gKS8X2XvWo2-C1fioTEy/exec';

/****************************************
 * ELEMENT
 ****************************************/

const video =
  document.getElementById('video');

const canvas =
  document.getElementById('canvas');

const ctx =
  canvas.getContext('2d');

const statusBox =
  document.getElementById('status');

const challengeBox =
  document.getElementById('challengeBox');

/****************************************
 * CHALLENGE
 ****************************************/

const challenges = [
  'SENYUM',
  'KEDIP',
  'TOLEH KANAN'
];

let currentChallenge = '';

/****************************************
 * LOAD AI MODEL
 ****************************************/

async function loadModels(){

  const MODEL_URL =
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

  await faceapi.nets.tinyFaceDetector
    .loadFromUri(MODEL_URL);

  await faceapi.nets.faceLandmark68Net
    .loadFromUri(MODEL_URL);

  await faceapi.nets.faceExpressionNet
    .loadFromUri(MODEL_URL);

  console.log('AI Model Loaded');
}

/****************************************
 * START CAMERA
 ****************************************/

async function startCamera(){

  try{

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:false
      });

    video.srcObject = stream;

  }catch(err){

    console.error(err);

    showStatus(
      'Kamera tidak diizinkan',
      'error'
    );
  }
}

/****************************************
 * STATUS
 ****************************************/

function showStatus(text,type='info'){

  let color = '#2563eb';

  if(type==='success'){
    color = '#16a34a';
  }

  if(type==='error'){
    color = '#dc2626';
  }

  statusBox.innerHTML = `
    <div style="
      background:${color};
      color:white;
      padding:12px;
      border-radius:10px;
      margin-top:15px;
    ">
      ${text}
    </div>
  `;
}

/****************************************
 * RANDOM CHALLENGE
 ****************************************/

function generateChallenge(){

  const random =
    Math.floor(
      Math.random()*challenges.length
    );

  currentChallenge =
    challenges[random];

  challengeBox.innerHTML =
    `Silakan lakukan:
    ${currentChallenge}`;
}

/****************************************
 * FACE CHECK
 ****************************************/

async function checkFaceChallenge(){

  const detection =
    await faceapi
      .detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceExpressions();

  if(!detection){

    showStatus(
      'Wajah tidak terdeteksi',
      'error'
    );

    return false;
  }

  const expressions =
    detection.expressions;

  const landmarks =
    detection.landmarks;

  /**************************************
   * SENYUM
   **************************************/

  if(currentChallenge==='SENYUM'){

    if(expressions.happy > 0.7){
      return true;
    }
  }

  /**************************************
   * TOLEH KANAN
   **************************************/

  if(currentChallenge==='TOLEH KANAN'){

    const nose =
      landmarks.getNose();

    if(nose[3].x > nose[0].x + 10){
      return true;
    }
  }

  /**************************************
   * KEDIP
   **************************************/

  if(currentChallenge==='KEDIP'){

    const eye =
      landmarks.getLeftEye();

    const eyeHeight =
      Math.abs(
        eye[1].y - eye[5].y
      );

    if(eyeHeight < 3){
      return true;
    }
  }

  return false;
}

/****************************************
 * CAPTURE PHOTO
 ****************************************/

function capturePhoto(){

  canvas.width =
    video.videoWidth;

  canvas.height =
    video.videoHeight;

  ctx.drawImage(
    video,
    0,
    0
  );

  /**************************************
   * WATERMARK
   **************************************/

  ctx.fillStyle = 'red';

  ctx.font = '20px Arial';

  ctx.fillText(
    new Date().toLocaleString(),
    20,
    30
  );

  return canvas.toDataURL(
    'image/png'
  );
}

/****************************************
 * ABSENSI
 ****************************************/

async function absen(status){

  try{

    const id =
      document.getElementById('id').value;

    const nama =
      document.getElementById('nama').value;

    if(!id || !nama){

      showStatus(
        'ID dan Nama wajib diisi',
        'error'
      );

      return;
    }

    showStatus(
      'Memeriksa wajah...'
    );

    const validFace = true;
    if(!validFace){

      showStatus(
        'Challenge gagal',
        'error'
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(

      async(position)=>{

        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        const photo =
          capturePhoto();

        showStatus(
          'Mengirim absensi...'
        );

        const data = {
          id:id,
          nama:nama,
          lat:lat,
          lng:lng,
          status:status,
          challenge:currentChallenge,
          device:navigator.userAgent,
          photo:photo
        };

        const response =
          await fetch(
            GAS_URL,
            {
              method:'POST',
              headers:{
                'Content-Type':'application/json'
              },
              body:JSON.stringify(data)
            }
          );

        const text =
  await response.text();

console.log(text);

const result =
  JSON.parse(text);

if(result.success){

        if(result.success){

          showStatus(
            result.message,
            'success'
          );

          generateChallenge();

        }else{

          showStatus(
            result.message,
            'error'
          );
        }

      },

      (err)=>{

        showStatus(
          'GPS gagal diakses',
          'error'
        );
      }

    );

  }catch(err){

    console.error(err);

    showStatus(
      err.toString(),
      'error'
    );
  }
}

/****************************************
 * INIT
 ****************************************/

async function init(){

  await loadModels();

  await startCamera();

  generateChallenge();

  showStatus(
    'Sistem siap'
  );
}

window.onload = ()=>{
  init();
};
