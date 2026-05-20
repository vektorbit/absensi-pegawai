const GAS_URL =
'https://script.google.com/macros/s/AKfycbwag4f8mS1a22bJro1kUco7NGJo48R-_0LTSWxJ0N5Uh3D2gKS8X2XvWo2-C1fioTEy/exec';

const statusBox =
document.getElementById('status');

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

async function login(){

  try{

    const id =
    document.getElementById('id').value;

    const password =
    document.getElementById('password').value;

    if(!id || !password){

      showStatus(
        'Isi semua field',
        'error'
      );

      return;
    }

    showStatus(
      'Memproses login...'
    );

    const data = {

      action:'login',
      id:id,
      password:password

    };

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

      localStorage.setItem(
        'pegawai',
        JSON.stringify(result.user)
      );

      showStatus(
        'Login berhasil',
        'success'
      );

      setTimeout(()=>{

        window.location =
        'index.html';

      },1000);

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
}
