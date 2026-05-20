const GAS_URL =
'https://script.google.com/macros/s/AKfycbwag4f8mS1a22bJro1kUco7NGJo48R-_0LTSWxJ0N5Uh3D2gKS8X2XvWo2-C1fioTEy/exec';

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

  try {

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

  } catch(err){

    console.error(err);

    showStatus(
      'Kamera gagal',
      'error'
    );
  }
}

/****************************************
 * STATUS
 ****************************************/

function showStatus(text,type='info'){

  let color = '#2563eb';

  if(type === 'success'){
    color = '#16a34a';
  }

  if(type === 'error'){
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
 * FOTO
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

  return canvas.toDataURL(
    'image/png'
  );
}

/****************************************
 * ABSENSI
 ****************************************/

async function absen(status){

  try {

   const user =
JSON.parse(
  localStorage.getItem(
    'pegawai'
  )
);

if(!user){

  window.location =
  'login.html';

  return;
}

const id =
user.id;

const nama =
user.nama;
    
    
    
    {

      showStatus(
        'Isi ID dan Nama',
        'error'
      );

      return;
    }

    showStatus(
      'Mengambil GPS...'
    );

    navigator.geolocation.getCurrentPosition(

      async(position)=>{

        try {

          const lat =
          position.coords.latitude;

          const lng =
          position.coords.longitude;

          const photo =
          capturePhoto();

          const data = {

            id:id,
            nama:nama,
            lat:lat,
            lng:lng,
            status:status,
            photo:photo
          };

          console.log(data);

          showStatus(
            'Mengirim absensi...'
          );

          const response =
          await fetch(
            GAS_URL,
            {
              method:'POST',
              body:JSON.stringify(data)
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

          } else {

            showStatus(
              result.message,
              'error'
            );
          }

        } catch(err){

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
          'GPS gagal',
          'error'
        );
      }

    );

  } catch(err){

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

window.onload = async()=>{

  checkLogin();

  await startCamera();

};
const statusBox =
document.getElementById('status');

function checkLogin(){

  const user =
  JSON.parse(
    localStorage.getItem(
      'pegawai'
    )
  );

  if(!user){

    window.location =
    'login.html';

    return;
  }

  document.getElementById(
    'userNama'
  ).innerHTML =

  `
    <b>${user.nama}</b>
    <br>
    ${user.id}
  `;
}

function logout(){

  localStorage.removeItem(
    'pegawai'
  );

  window.location =
  'login.html';
}
