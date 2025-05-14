const datosLogin = {
    usuarios: [
      {
        username: "reader",
        password: "r",
        role: "reader"
      },
      {
        username: "x",
        password: "x",
        role: "writer"
      },
      {
        username: "y",
        password: "y",
        role: "writer"
      },
      {
        username: "z",
        password: "z",
        role: "writer"
      }
    ]
  };
  
  let datosPorUsuario = localStorage.getItem('datosPorUsuario') 
    ? JSON.parse(localStorage.getItem('datosPorUsuario')) 
    : {
        x: {
          personajes: [
            {
              nombre: "Marie Curie",
              nacimiento: "1867",
              muerte: "1934",
              imagen: "https://sandramoreno.blog/wp-content/uploads/2024/07/marie-curie.jpg",
              wiki: "https://es.wikipedia.org/wiki/Marie_Curie"
            },
            {
              nombre: "Albert Einstein",
              nacimiento: "1879",
              muerte: "1955",
              imagen: "https://statics.forbes.com.ec/2020/05/crop/5ec568aaba962__600x390.webp",
              wiki: "https://es.wikipedia.org/wiki/Albert_Einstein"
            },
            {
              nombre: "Nikola Tesla",
              nacimiento: "1856",
              muerte: "1943",
              imagen: "https://historia.nationalgeographic.com.es/medio/2024/07/10/nikola-tesla_00000000_df1dc55d_240710162742_800x800.jpg",
              wiki: "https://es.wikipedia.org/wiki/Nikola_Tesla"
            }
          ],
          entidades: [
            {
              nombre: "Universidad de París",
              nacimiento: "1150",
              muerte: "actualidad",
              imagen: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Armoiries_de_l%27Universit%C3%A9_de_Paris.png",
              wiki: "https://es.wikipedia.org/wiki/Universidad_de_Par%C3%ADs",
              personas: ["Marie Curie", "Pierre Curie"]
            },
            {
              nombre: "Instituto Max Planck",
              nacimiento: "1948",
              muerte: "actualidad",
              imagen: "https://covesion.com/wp-content/uploads/2024/07/Max-Planck-Gesellschaft.png.webp",
              wiki: "https://es.wikipedia.org/wiki/Max_Planck_Society",
              personas: ["Albert Einstein", "Max Planck"]
            },
            {
              nombre: "Laboratorio Edison",
              nacimiento: "1876",
              muerte: "actualidad",
              imagen: "https://cdn.worldvectorlogo.com/logos/edison.svg",
              wiki: "https://es.wikipedia.org/wiki/Thomas_Edison",
              personas: ["Thomas Edison"]
            }
          ],
          productos: [
            {
              nombre: "Teoría de la radiactividad",
              nacimiento: "1898",
              muerte: "actualidad",
              imagen: "https://invdes.com.mx/wp-content/uploads/2017/09/22-09-17-moleculas.jpg",
              wiki: "https://es.wikipedia.org/wiki/Radiactividad",
              entidades: ["Universidad de París", "Instituto del Radio"],
              personas: ["Marie Curie", "Henri Becquerel"]
            },
            {
              nombre: "Teoría de la relatividad",
              nacimiento: "1905",
              muerte: "actualidad",
              imagen: "https://grupovierci.brightspotcdn.com/dims4/default/6da36d2/2147483647/strip/true/crop/1200x675+0+105/resize/1440x810!/quality/90/?url=https%3A%2F%2Fk2-prod-grupo-vierci.s3.us-east-1.amazonaws.com%2Fbrightspot%2Fadjuntos%2F161%2Fimagenes%2F002%2F364%2F0002364230.jpg",
              wiki: "https://es.wikipedia.org/wiki/Teor%C3%ADa_de_la_relatividad",
              entidades: ["Instituto Max Planck"],
              personas: ["Albert Einstein"]
            },
            {
              nombre: "Corriente alterna",
              nacimiento: "1888",
              muerte: "actualidad",
              imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVC1T6-kc799dei9YJj8yzZ_pcL7fEV5pAkw&s",
              wiki: "https://es.wikipedia.org/wiki/Corriente_alterna",
              entidades: ["Laboratorio Edison"],
              personas: ["Nikola Tesla"]
            }
          ]
        }
      };
  
  function guardarDatos() {
    localStorage.setItem('datosPorUsuario', JSON.stringify(datosPorUsuario));
  }