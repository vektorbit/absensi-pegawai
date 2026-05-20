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

    showStatus(
      'Kamera aktif',
      'success'
    );

  }catch(err){

    console.error(err);

    showStatus(
      'Kamera gagal diakses',
      'error'
    );
  }
}

/****************************************
 * STATUS
 ****************************************/

function showStatus(
  text,
  type='info'
){

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
      text-align:center;
      font-weight:bold;
    ">
      ${text}
    </div>
  `;
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
      'Mengambil GPS...'
    );

    navigator.geolocation.getCurrentPosition(

      async(position)=>{

        try{

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

            device:
              navigator.userAgent,

            photo:photo
          };

          console.log(data);

          const response =
            await fetch(
              GAS_URL,
              {
                method:'POST',

                headers:{
                  'Content-Type':
                    'application/json'
                },

                body:
                  JSON.stringify(data)
              }
            );

          const text =
            await response.text();

          console.log(text);

          const result =
            JSON.parse(text);

          if(result.success){

            showStatus(
              result.message,
              'success'
            );

          }else{

            showStatus(
              result.message,
              'error'
            );
          }

        }catch(err){

          console.error(err);

          showStatus(
            err.toString(),
            'error'
          );
        }

      },

      (err)=>{

        console.error(err);

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

  await startCamera();

  showStatus(
    'Sistem siap',
    'success'
  );
}

window.onload = ()=>{
  init();
};
