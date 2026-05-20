const GAS_URL =
'https://script.google.com/macros/s/AKfycbwag4f8mS1a22bJro1kUco7NGJo48R-_0LTSWxJ0N5Uh3D2gKS8X2XvWo2-C1fioTEy/exec';

/****************************************
 * CHECK LOGIN
 ****************************************/

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

  /********************************
   * HANYA ADMIN
   ********************************/

  if(user.role !== 'admin'){

    alert(
      'Akses ditolak'
    );

    window.location =
    'index.html';

    return;
  }

  document.getElementById(
    'adminInfo'
  ).innerHTML =

  `
    <b>${user.nama}</b>
    <br>
    ADMIN
  `;
}

/****************************************
 * LOGOUT
 ****************************************/

function logout(){

  localStorage.removeItem(
    'pegawai'
  );

  window.location =
  'login.html';
}

/****************************************
 * LOAD ABSENSI
 ****************************************/

async function loadAbsensi(){

  try{

    const tanggal =
    document.getElementById(
      'filterTanggal'
    ).value;

    const response =
    await fetch(
      GAS_URL,
      {
        method:'POST',

        body:JSON.stringify({

          action:'dashboard',
          tanggal:tanggal

        })
      }
    );

    const text =
    await response.text();

    console.log(text);

    const result =
    JSON.parse(text);

    renderTable(
      result.data
    );

  }catch(err){

    console.error(err);

    alert(err);
  }
}

/****************************************
 * RENDER TABLE
 ****************************************/

function renderTable(data){

  let html = `
  
  <table border="1"
         width="100%"
         cellspacing="0"
         cellpadding="5">

    <tr>

      <th>TANGGAL</th>
      <th>JAM</th>
      <th>NAMA</th>
      <th>STATUS</th>
      <th>JARAK</th>
      <th>FOTO</th>

    </tr>
  `;

  let hadir = 0;

  data.forEach(item=>{

    hadir++;

    html += `

      <tr>

        <td>${item.tanggal}</td>

        <td>${item.jam}</td>

        <td>${item.nama}</td>

        <td>${item.status}</td>

        <td>${item.jarak} m</td>

        <td>

          <a href="${item.foto}"
             target="_blank">

            FOTO

          </a>

        </td>

      </tr>
    `;
  });

  html += '</table>';

  document.getElementById(
    'tableBox'
  ).innerHTML = html;

  document.getElementById(
    'statistik'
  ).innerHTML =

  `
    <h3>
      Total Absensi:
      ${hadir}
    </h3>
  `;
}

/****************************************
 * INIT
 ****************************************/

window.onload = ()=>{

  checkLogin();

  const today =
  new Date()
    .toISOString()
    .split('T')[0];

  document.getElementById(
    'filterTanggal'
  ).value = today;

  loadAbsensi();
};
