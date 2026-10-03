/* =========================================================
   Lumaria — Datos de flora y fauna nativa por región
   Estados de conservación referenciales (RCE / UICN).
   ========================================================= */

const REGIONES = [
  {
    id: "arica", num: "XV", nombre: "Arica y Parinacota", capital: "Arica",
    color: "#c9822f",
    lema: "Donde el altiplano toca el cielo",
    desc: "Del mar a más de 4.500 metros en pocos kilómetros: valles fértiles como Azapa y Lluta, quebradas con cactus milenarios y el altiplano del Parque Nacional Lauca, con el lago Chungará reflejando al volcán Parinacota.",
    ecosistemas: ["Altiplano", "Bofedales", "Valles desérticos", "Costa"],
    flora: [
      { nombre: "Queñoa", cientifico: "Polylepis tarapacana", estado: "Casi amenazada", endemica: false,
        desc: "El árbol que crece a mayor altitud del planeta, sobre los 4.000 m. Su corteza en capas lo protege de las heladas altiplánicas." },
      { nombre: "Llareta", cientifico: "Azorella compacta", estado: "Vulnerable", endemica: false,
        desc: "Planta en cojín tan densa que parece una roca verde. Algunas superan los 3.000 años de edad." },
      { nombre: "Cactus candelabro", cientifico: "Browningia candelaris", estado: "Vulnerable", endemica: false,
        desc: "Columnar y ramificado en la copa como un candelabro. Habita laderas áridas entre los 2.000 y 3.000 m." },
      { nombre: "Tola", cientifico: "Parastrephia lepidophylla", estado: null, endemica: false,
        desc: "Arbusto resinoso del altiplano, usado tradicionalmente como leña y en medicina andina." }
    ],
    fauna: [
      { nombre: "Picaflor de Arica", cientifico: "Eulidia yarrellii", estado: "En peligro crítico", endemica: true,
        desc: "El ave más pequeña de Chile, de apenas 7 cm. Sobrevive en los valles de Azapa, Lluta y Camarones." },
      { nombre: "Vicuña", cientifico: "Vicugna vicugna", estado: "Preocupación menor", endemica: false,
        desc: "Camélido silvestre de fibra finísima. Estuvo al borde de la extinción y hoy se recupera en el Lauca." },
      { nombre: "Taruca", cientifico: "Hippocamelus antisensis", estado: "En peligro", endemica: false,
        desc: "Ciervo andino del norte, pariente del huemul, que habita quebradas rocosas de la precordillera." },
      { nombre: "Suri", cientifico: "Rhea pennata tarapacensis", estado: "Vulnerable", endemica: false,
        desc: "Ñandú del altiplano. El macho incuba los huevos y cuida a las crías." }
    ]
  },
  {
    id: "tarapaca", num: "I", nombre: "Tarapacá", capital: "Iquique",
    color: "#cf9440",
    lema: "Bosques en medio del desierto",
    desc: "La Pampa del Tamarugal guarda un bosque que bebe de napas subterráneas en uno de los lugares más secos del mundo. Al oriente, el Salar del Huasco es un oasis para aves andinas.",
    ecosistemas: ["Pampa del Tamarugal", "Salares", "Desierto costero", "Precordillera"],
    flora: [
      { nombre: "Tamarugo", cientifico: "Prosopis tamarugo", estado: "En peligro", endemica: true,
        desc: "Árbol endémico capaz de vivir donde casi no llueve, gracias a raíces que alcanzan agua subterránea." },
      { nombre: "Copao de Iquique", cientifico: "Eulychnia iquiquensis", estado: "Vulnerable", endemica: true,
        desc: "Cactus columnar costero que se hidrata con la camanchaca, la neblina que sube desde el mar." },
      { nombre: "Rica-rica", cientifico: "Acantholippia deserticola", estado: null, endemica: false,
        desc: "Arbusto aromático de la precordillera, usado en infusiones digestivas por comunidades andinas." },
      { nombre: "Paja brava", cientifico: "Festuca orthophylla", estado: null, endemica: false,
        desc: "Gramínea dura que forma extensos pajonales y sostiene la vida del altiplano." }
    ],
    fauna: [
      { nombre: "Tamaruguito", cientifico: "Conirostrum tamarugense", estado: "Vulnerable", endemica: false,
        desc: "Pequeña ave que depende del tamarugo para alimentarse de insectos durante el invierno." },
      { nombre: "Gaviota garuma", cientifico: "Leucophaeus modestus", estado: "Vulnerable", endemica: false,
        desc: "Se alimenta en la costa pero anida en pleno desierto, a decenas de kilómetros del mar." },
      { nombre: "Flamenco chileno", cientifico: "Phoenicopterus chilensis", estado: "Casi amenazada", endemica: false,
        desc: "Rosado intenso, filtra pequeños crustáceos en las lagunas salobres del Salar del Huasco." },
      { nombre: "Vizcacha", cientifico: "Lagidium viscacia", estado: "Preocupación menor", endemica: false,
        desc: "Roedor de roquedales andinos, de larga cola enroscada. Toma el sol en grupos al amanecer." }
    ]
  },
  {
    id: "antofagasta", num: "II", nombre: "Antofagasta", capital: "Antofagasta",
    color: "#d4a052",
    lema: "El desierto más árido del mundo",
    desc: "Salares, géiseres y volcanes rodean San Pedro de Atacama. En la costa, las lomas de Paposo florecen con la neblina, y las aguas frías de Humboldt sostienen una rica vida marina.",
    ecosistemas: ["Desierto de Atacama", "Salares", "Oasis de niebla", "Litoral"],
    flora: [
      { nombre: "Copiapoa", cientifico: "Copiapoa cinerea", estado: "Vulnerable", endemica: true,
        desc: "Cactus de cuerpo gris ceniza que refleja el sol. Crece en las laderas costeras de Taltal." },
      { nombre: "Cardón", cientifico: "Echinopsis atacamensis", estado: "Vulnerable", endemica: false,
        desc: "Cactus gigante de hasta 7 m. Su madera se usó en techos e iglesias atacameñas." },
      { nombre: "Chañar", cientifico: "Geoffroea decorticans", estado: null, endemica: false,
        desc: "Árbol de oasis cuyo fruto dulce se usa para hacer arrope y harina." },
      { nombre: "Lechero", cientifico: "Euphorbia lactiflua", estado: null, endemica: true,
        desc: "Arbusto de las lomas costeras con savia blanca; reverdece cuando llega la camanchaca." }
    ],
    fauna: [
      { nombre: "Parina chica", cientifico: "Phoenicoparrus jamesi", estado: "Casi amenazada", endemica: false,
        desc: "El flamenco más pequeño de los Andes, habitante de salares sobre los 3.000 m." },
      { nombre: "Gato andino", cientifico: "Leopardus jacobita", estado: "En peligro", endemica: false,
        desc: "Uno de los felinos más raros del mundo; vive en roquedales de alta montaña." },
      { nombre: "Chungungo", cientifico: "Lontra felina", estado: "Vulnerable", endemica: false,
        desc: "La nutria marina más pequeña del mundo, habitante de costas rocosas del Pacífico." },
      { nombre: "Rana del Loa", cientifico: "Telmatobius dankoi", estado: "En peligro crítico", endemica: true,
        desc: "Rana acuática que sobrevive en un único afloramiento de agua cerca de Calama." }
    ]
  },
  {
    id: "atacama", num: "III", nombre: "Atacama", capital: "Copiapó",
    color: "#c9a85a",
    lema: "Tierra del desierto florido",
    desc: "Cuando llueve más de lo normal, el desierto despierta en un manto de flores. El Parque Pan de Azúcar une cactus y pingüinos, y en la cordillera brillan lagunas como Santa Rosa y Negro Francisco.",
    ecosistemas: ["Desierto florido", "Cordillera alta", "Costa", "Lagunas altoandinas"],
    flora: [
      { nombre: "Garra de león", cientifico: "Leontochir ovallei", estado: "En peligro", endemica: true,
        desc: "Una de las flores más raras y bellas del desierto florido, de un rojo intenso." },
      { nombre: "Pata de guanaco", cientifico: "Cistanthe longiscapa", estado: null, endemica: true,
        desc: "Tiñe de fucsia llanuras enteras durante el desierto florido." },
      { nombre: "Añañuca", cientifico: "Rhodophiala phycelloides", estado: null, endemica: true,
        desc: "Bulbo de flores rojas; según la leyenda nació del amor entre una joven y un minero." },
      { nombre: "Suspiro", cientifico: "Nolana paradoxa", estado: null, endemica: false,
        desc: "Rastrera de flores azul celeste que cubre dunas y laderas costeras." }
    ],
    fauna: [
      { nombre: "Guanaco", cientifico: "Lama guanicoe", estado: "Vulnerable", endemica: false,
        desc: "El camélido silvestre más grande de Sudamérica, ágil en quebradas y llanos." },
      { nombre: "Chinchilla de cola corta", cientifico: "Chinchilla chinchilla", estado: "En peligro", endemica: false,
        desc: "Roedor de pelaje densísimo que vive entre rocas sobre los 3.500 m." },
      { nombre: "Pingüino de Humboldt", cientifico: "Spheniscus humboldti", estado: "Vulnerable", endemica: false,
        desc: "Anida en Isla Pan de Azúcar, en cuevas y grietas cerca del mar." },
      { nombre: "Flamenco andino", cientifico: "Phoenicoparrus andinus", estado: "Vulnerable", endemica: false,
        desc: "Patas amarillas y plumaje rosado; se reúne en las lagunas Santa Rosa y Negro Francisco." }
    ]
  },
  {
    id: "coquimbo", num: "IV", nombre: "Coquimbo", capital: "La Serena",
    color: "#a8a35a",
    lema: "Un bosque que vive de la neblina",
    desc: "En Fray Jorge sobrevive un bosque relicto de tipo valdiviano alimentado por la niebla, a cientos de kilómetros de su pariente sureño. Frente a la costa, las islas Choros y Damas son santuario de vida marina.",
    ecosistemas: ["Bosque relicto", "Matorral semiárido", "Islas costeras", "Valles transversales"],
    flora: [
      { nombre: "Guayacán", cientifico: "Porlieria chilensis", estado: "Vulnerable", endemica: true,
        desc: "Arbusto de madera durísima y pesada, muy codiciada en el pasado." },
      { nombre: "Olivillo", cientifico: "Aextoxicon punctatum", estado: null, endemica: false,
        desc: "Árbol dominante del bosque de Fray Jorge, que capta el agua de la neblina." },
      { nombre: "Carbonillo", cientifico: "Cordia decandra", estado: "Vulnerable", endemica: true,
        desc: "Arbusto de flores blancas en forma de campana, típico del norte chico." },
      { nombre: "Lúcumo chileno", cientifico: "Pouteria splendens", estado: "Vulnerable", endemica: true,
        desc: "Arbusto costero de hojas brillantes y frutos comestibles, restringido a acantilados." }
    ],
    fauna: [
      { nombre: "Chinchilla de cola larga", cientifico: "Chinchilla lanigera", estado: "En peligro", endemica: true,
        desc: "Protegida en la Reserva Las Chinchillas de Illapel; casi extinta por la caza de su piel." },
      { nombre: "Delfín nariz de botella", cientifico: "Tursiops truncatus", estado: "Preocupación menor", endemica: false,
        desc: "Una población residente juega en las aguas de Punta de Choros." },
      { nombre: "Degú", cientifico: "Octodon degus", estado: "Preocupación menor", endemica: true,
        desc: "Roedor social y diurno que construye madrigueras comunitarias en el matorral." },
      { nombre: "Yunco", cientifico: "Pelecanoides garnotii", estado: "En peligro", endemica: false,
        desc: "Pequeña ave buceadora que anida en cuevas en las islas de la región." }
    ]
  },
  {
    id: "valparaiso", num: "V", nombre: "Valparaíso", capital: "Valparaíso",
    color: "#7f9a52",
    lema: "Del continente a las islas oceánicas",
    desc: "El Parque La Campana protege el mayor palmar de palma chilena. La región incluye además dos joyas oceánicas: el archipiélago Juan Fernández, con altísimo endemismo, y Rapa Nui.",
    ecosistemas: ["Bosque esclerófilo", "Palmares", "Islas oceánicas", "Humedales costeros"],
    flora: [
      { nombre: "Palma chilena", cientifico: "Jubaea chilensis", estado: "Vulnerable", endemica: true,
        desc: "La palmera más austral del mundo; puede vivir más de 500 años." },
      { nombre: "Belloto del norte", cientifico: "Beilschmiedia miersii", estado: "Vulnerable", endemica: true,
        desc: "Monumento natural, crece en quebradas húmedas de la costa central." },
      { nombre: "Peumo", cientifico: "Cryptocarya alba", estado: null, endemica: true,
        desc: "Árbol aromático de frutos rojos, emblema del bosque esclerófilo." },
      { nombre: "Toromiro", cientifico: "Sophora toromiro", estado: "Extinta en estado silvestre", endemica: true,
        desc: "Árbol sagrado de Rapa Nui. Sobrevive gracias a ejemplares cultivados en jardines botánicos." }
    ],
    fauna: [
      { nombre: "Picaflor de Juan Fernández", cientifico: "Sephanoides fernandensis", estado: "En peligro crítico", endemica: true,
        desc: "Vive solo en Isla Robinson Crusoe; machos rojo canela y hembras verde y blanco." },
      { nombre: "Lobo fino de Juan Fernández", cientifico: "Arctocephalus philippii", estado: "Preocupación menor", endemica: true,
        desc: "Se creyó extinto en el siglo XX y hoy se recupera en el archipiélago." },
      { nombre: "Rana grande chilena", cientifico: "Calyptocephalella gayi", estado: "Vulnerable", endemica: true,
        desc: "Un fósil viviente: su linaje existe desde la época de los dinosaurios." },
      { nombre: "Tenca", cientifico: "Mimus thenca", estado: "Preocupación menor", endemica: true,
        desc: "Gran cantora del matorral central, capaz de imitar a otras aves." }
    ]
  },
  {
    id: "metropolitana", num: "RM", nombre: "Metropolitana", capital: "Santiago",
    color: "#6f9550",
    lema: "Naturaleza a las puertas de la ciudad",
    desc: "Rodeada por la cordillera de los Andes y la de la Costa, la región conserva bosque esclerófilo y matorral mediterráneo, uno de los ecosistemas más amenazados y biodiversos del planeta.",
    ecosistemas: ["Bosque esclerófilo", "Matorral andino", "Alta cordillera", "Quebradas"],
    flora: [
      { nombre: "Quillay", cientifico: "Quillaja saponaria", estado: null, endemica: true,
        desc: "Su corteza produce espuma y se ha usado como jabón desde tiempos prehispánicos." },
      { nombre: "Litre", cientifico: "Lithrea caustica", estado: null, endemica: true,
        desc: "Árbol resistente a la sequía; su contacto puede producir alergia en la piel." },
      { nombre: "Espino", cientifico: "Vachellia caven", estado: null, endemica: false,
        desc: "De flores amarillas perfumadas; forma los espinales del valle central." },
      { nombre: "Maitén", cientifico: "Maytenus boaria", estado: null, endemica: false,
        desc: "Árbol de copa colgante y follaje fino, apreciado por el ganado y las aves." }
    ],
    fauna: [
      { nombre: "Cóndor andino", cientifico: "Vultur gryphus", estado: "Vulnerable", endemica: false,
        desc: "Ave nacional con hasta 3 m de envergadura; planea sobre los cajones cordilleranos." },
      { nombre: "Turca", cientifico: "Pteroptochos megapodius", estado: "Preocupación menor", endemica: true,
        desc: "Ave caminadora de patas fuertes que levanta la cola; su canto resuena en laderas." },
      { nombre: "Zorro culpeo", cientifico: "Lycalopex culpaeus", estado: "Preocupación menor", endemica: false,
        desc: "El cánido silvestre más grande de Chile, presente desde el altiplano a Tierra del Fuego." },
      { nombre: "Iguana chilena", cientifico: "Callopistes maculatus", estado: "Vulnerable", endemica: true,
        desc: "Lagarto robusto y manchado, cazador activo de laderas soleadas." }
    ]
  },
  {
    id: "ohiggins", num: "VI", nombre: "O'Higgins", capital: "Rancagua",
    color: "#5f9152",
    lema: "Cipreses, palmas y loros",
    desc: "La Reserva Río de los Cipreses protege bosques de ciprés de la cordillera y la mayor colonia de loros tricahue. En la costa, Cocalán alberga uno de los grandes palmares del país.",
    ecosistemas: ["Bosque de ciprés", "Esclerófilo", "Cajones andinos", "Costa"],
    flora: [
      { nombre: "Ciprés de la cordillera", cientifico: "Austrocedrus chilensis", estado: "Casi amenazada", endemica: false,
        desc: "Conífera longeva que forma bosques en laderas secas de la precordillera." },
      { nombre: "Boldo", cientifico: "Peumus boldus", estado: null, endemica: true,
        desc: "Sus hojas aromáticas son famosas en infusiones digestivas." },
      { nombre: "Roble de Santiago", cientifico: "Nothofagus macrocarpa", estado: "Vulnerable", endemica: true,
        desc: "El Nothofagus más septentrional del país, relicto de climas más fríos." },
      { nombre: "Palma chilena", cientifico: "Jubaea chilensis", estado: "Vulnerable", endemica: true,
        desc: "Forma el palmar de Cocalán, uno de los más importantes que quedan." }
    ],
    fauna: [
      { nombre: "Loro tricahue", cientifico: "Cyanoliseus patagonus bloxami", estado: "En peligro", endemica: true,
        desc: "El loro más grande de Chile; anida en barrancos del río de los Cipreses." },
      { nombre: "Puma", cientifico: "Puma concolor", estado: "Casi amenazada", endemica: false,
        desc: "El gran felino de América, depredador clave de los ecosistemas andinos." },
      { nombre: "Chingue", cientifico: "Conepatus chinga", estado: "Preocupación menor", endemica: false,
        desc: "Mofeta de franjas blancas que se defiende con un líquido de fuerte olor." },
      { nombre: "Culebra de cola larga", cientifico: "Philodryas chamissonis", estado: "Preocupación menor", endemica: true,
        desc: "Serpiente ágil y esbelta, controladora natural de roedores." }
    ]
  },
  {
    id: "maule", num: "VII", nombre: "Maule", capital: "Talca",
    color: "#4f8a4f",
    lema: "Refugio de árboles únicos",
    desc: "La cordillera de la Costa del Maule esconde árboles que no existen en ningún otro lugar, como el ruil. En los Andes, Altos de Lircay y Radal Siete Tazas muestran bosques, cascadas y pozones turquesa.",
    ecosistemas: ["Bosque maulino", "Cordillera de la Costa", "Bosque andino", "Ríos"],
    flora: [
      { nombre: "Ruil", cientifico: "Nothofagus alessandrii", estado: "En peligro", endemica: true,
        desc: "Considerado el árbol más antiguo de la familia Nothofagus; quedan pocos bosquetes." },
      { nombre: "Queule", cientifico: "Gomortega keule", estado: "En peligro", endemica: true,
        desc: "Único representante de su familia en el mundo; da frutos amarillos comestibles." },
      { nombre: "Pitao", cientifico: "Pitavia punctata", estado: "En peligro", endemica: true,
        desc: "Arbolito de quebradas húmedas, pariente lejano de los cítricos." },
      { nombre: "Hualo", cientifico: "Nothofagus glauca", estado: "Vulnerable", endemica: true,
        desc: "Roble maulino de corteza gruesa y resquebrajada, resistente a incendios." }
    ],
    fauna: [
      { nombre: "Huiña", cientifico: "Leopardus guigna", estado: "Vulnerable", endemica: false,
        desc: "El felino más pequeño de América, tímido habitante de bosques densos." },
      { nombre: "Yaca", cientifico: "Thylamys elegans", estado: "Preocupación menor", endemica: true,
        desc: "Pequeño marsupial nocturno que almacena grasa en la cola para el invierno." },
      { nombre: "Choroy", cientifico: "Enicognathus leptorhynchus", estado: "Preocupación menor", endemica: true,
        desc: "Loro verde de pico largo y curvo, ideal para extraer piñones y semillas." },
      { nombre: "Zorro culpeo", cientifico: "Lycalopex culpaeus", estado: "Preocupación menor", endemica: false,
        desc: "Recorre bosques y matorrales en busca de roedores, aves y frutos." }
    ]
  },
  {
    id: "nuble", num: "XVI", nombre: "Ñuble", capital: "Chillán",
    color: "#438350",
    lema: "Volcanes y el último huemul del centro",
    desc: "La región más joven de Chile. En el corredor biológico Nevados de Chillán–Laguna del Laja vive una pequeña población de huemules, aislada a cientos de kilómetros de sus parientes australes.",
    ecosistemas: ["Bosque caducifolio", "Volcanes", "Secano costero", "Valle central"],
    flora: [
      { nombre: "Roble", cientifico: "Nothofagus obliqua", estado: null, endemica: false,
        desc: "Árbol de hoja caduca que en otoño pinta de amarillo y naranjo los bosques." },
      { nombre: "Raulí", cientifico: "Nothofagus alpina", estado: null, endemica: false,
        desc: "De madera fina y rojiza, muy apreciada en mueblería." },
      { nombre: "Coigüe", cientifico: "Nothofagus dombeyi", estado: null, endemica: false,
        desc: "Siempreverde y majestuoso, supera los 40 m de altura." },
      { nombre: "Radal", cientifico: "Lomatia hirsuta", estado: null, endemica: false,
        desc: "Árbol de flores blanco-amarillentas y hojas coriáceas, típico de claros del bosque." }
    ],
    fauna: [
      { nombre: "Huemul", cientifico: "Hippocamelus bisulcus", estado: "En peligro", endemica: false,
        desc: "Ciervo del escudo nacional; la población de Ñuble es la más septentrional." },
      { nombre: "Chucao", cientifico: "Scelorchilus rubecula", estado: "Preocupación menor", endemica: false,
        desc: "Ave de pecho rojizo y canto fuerte; para los mapuche, presagio de buena o mala suerte." },
      { nombre: "Pato cortacorrientes", cientifico: "Merganetta armata", estado: "Preocupación menor", endemica: false,
        desc: "Nada y bucea con destreza en ríos torrentosos de montaña." },
      { nombre: "Puma", cientifico: "Puma concolor", estado: "Casi amenazada", endemica: false,
        desc: "Comparte el corredor biológico con el huemul, su presa natural." }
    ]
  },
  {
    id: "biobio", num: "VIII", nombre: "Biobío", capital: "Concepción",
    color: "#367c52",
    lema: "Bosques entre dos cordilleras",
    desc: "Del golfo de Arauco a la Laguna del Laja, el Biobío mezcla bosques costeros, humedales y volcanes. Su cordillera de la Costa es un refugio de especies que sobrevivieron a las glaciaciones.",
    ecosistemas: ["Bosque costero", "Humedales", "Cordillera de Nahuelbuta", "Volcanes"],
    flora: [
      { nombre: "Michay rojo", cientifico: "Berberidopsis corallina", estado: "En peligro", endemica: true,
        desc: "Enredadera de flores colgantes rojo coral, muy escasa en estado silvestre." },
      { nombre: "Avellano", cientifico: "Gevuina avellana", estado: null, endemica: false,
        desc: "Sus frutos tostados son un alimento tradicional del sur de Chile." },
      { nombre: "Lingue", cientifico: "Persea lingue", estado: null, endemica: false,
        desc: "Pariente silvestre del palto; su corteza se usó para curtir cueros." },
      { nombre: "Notro", cientifico: "Embothrium coccineum", estado: null, endemica: false,
        desc: "Florece como una llama roja intensa; atrae a picaflores en primavera." }
    ],
    fauna: [
      { nombre: "Ranita de Darwin", cientifico: "Rhinoderma darwinii", estado: "En peligro", endemica: false,
        desc: "El macho incuba los renacuajos dentro de su saco vocal: un caso único." },
      { nombre: "Pudú", cientifico: "Pudu puda", estado: "Vulnerable", endemica: false,
        desc: "Uno de los ciervos más pequeños del mundo, de unos 40 cm de alto." },
      { nombre: "Concón", cientifico: "Strix rufipes", estado: "Preocupación menor", endemica: false,
        desc: "Búho de bosque de canto grave; los mapuche lo asocian a presagios." },
      { nombre: "Picaflor chico", cientifico: "Sephanoides sephaniodes", estado: "Preocupación menor", endemica: false,
        desc: "Polinizador clave del bosque, con una corona iridiscente de fuego." }
    ]
  },
  {
    id: "araucania", num: "IX", nombre: "La Araucanía", capital: "Temuco",
    color: "#2c7556",
    lema: "Tierra de araucarias y volcanes",
    desc: "Los bosques de araucaria, el árbol sagrado del pueblo pewenche, rodean volcanes como el Llaima y el Villarrica. Conguillío y Nahuelbuta son santuarios de bosques milenarios.",
    ecosistemas: ["Bosque de araucaria", "Volcanes", "Lagos andinos", "Bosque templado"],
    flora: [
      { nombre: "Araucaria", cientifico: "Araucaria araucana", estado: "En peligro", endemica: false,
        desc: "Pewen sagrado; su semilla, el piñón, es alimento ancestral. Vive más de 1.000 años." },
      { nombre: "Copihue", cientifico: "Lapageria rosea", estado: null, endemica: true,
        desc: "Flor nacional de Chile, una enredadera de campanas rojas que trepa por los árboles." },
      { nombre: "Nalca", cientifico: "Gunnera tinctoria", estado: null, endemica: false,
        desc: "Hojas gigantes como paraguas; sus tallos tiernos se comen frescos." },
      { nombre: "Lleuque", cientifico: "Prumnopitys andina", estado: "Vulnerable", endemica: false,
        desc: "Conífera de frutos carnosos amarillos, escasa en la precordillera." }
    ],
    fauna: [
      { nombre: "Carpintero negro", cientifico: "Campephilus magellanicus", estado: "Preocupación menor", endemica: false,
        desc: "El macho luce cabeza roja; su golpeteo resuena en los bosques de Conguillío." },
      { nombre: "Cachaña", cientifico: "Enicognathus ferrugineus", estado: "Preocupación menor", endemica: false,
        desc: "Loro de los bosques australes, gran consumidor de semillas de araucaria." },
      { nombre: "Rayadito", cientifico: "Aphrastura spinicauda", estado: "Preocupación menor", endemica: false,
        desc: "Inquieto y curioso, recorre troncos y ramas buscando insectos." },
      { nombre: "Puma", cientifico: "Puma concolor", estado: "Casi amenazada", endemica: false,
        desc: "Ronda los bosques de araucaria en los parques de la región." }
    ]
  },
  {
    id: "losrios", num: "XIV", nombre: "Los Ríos", capital: "Valdivia",
    color: "#22705d",
    lema: "La selva valdiviana",
    desc: "Lluvias abundantes y ríos navegables dan vida a la selva valdiviana, uno de los bosques templados lluviosos más diversos del mundo. El Santuario Carlos Anwandter es hogar del cisne de cuello negro.",
    ecosistemas: ["Selva valdiviana", "Humedales", "Ríos", "Costa"],
    flora: [
      { nombre: "Ulmo", cientifico: "Eucryphia cordifolia", estado: null, endemica: false,
        desc: "Sus flores blancas producen la célebre miel de ulmo." },
      { nombre: "Arrayán", cientifico: "Luma apiculata", estado: null, endemica: false,
        desc: "Corteza canela que se descascara; forma bosques mágicos junto al agua." },
      { nombre: "Tepa", cientifico: "Laureliopsis philippiana", estado: null, endemica: false,
        desc: "Árbol aromático tolerante a la sombra, típico del bosque húmedo." },
      { nombre: "Costilla de vaca", cientifico: "Blechnum chilense", estado: null, endemica: false,
        desc: "Helecho grande que tapiza quebradas y orillas del bosque lluvioso." }
    ],
    fauna: [
      { nombre: "Cisne de cuello negro", cientifico: "Cygnus melancoryphus", estado: "Preocupación menor", endemica: false,
        desc: "Elegante habitante de humedales; el río Cruces es uno de sus principales hogares." },
      { nombre: "Monito del monte", cientifico: "Dromiciops gliroides", estado: "Casi amenazada", endemica: false,
        desc: "Marsupial diminuto y fósil viviente, más emparentado con los de Australia." },
      { nombre: "Coipo", cientifico: "Myocastor coypus", estado: "Preocupación menor", endemica: false,
        desc: "Roedor semiacuático de dientes naranjos que vive en riberas y humedales." },
      { nombre: "Huillín", cientifico: "Lontra provocax", estado: "En peligro", endemica: false,
        desc: "Nutria de río, sensible a la contaminación: indica aguas sanas." }
    ]
  },
  {
    id: "loslagos", num: "X", nombre: "Los Lagos", capital: "Puerto Montt",
    color: "#1f6a68",
    lema: "Alerces milenarios y archipiélagos",
    desc: "Volcanes nevados, lagos azules y bosques de alerce de más de 3.000 años. Chiloé y sus mares interiores son zona de alimentación de la ballena azul.",
    ecosistemas: ["Bosque de alerce", "Lagos", "Archipiélago de Chiloé", "Mar interior"],
    flora: [
      { nombre: "Alerce", cientifico: "Fitzroya cupressoides", estado: "En peligro", endemica: false,
        desc: "Uno de los árboles más longevos del planeta; un ejemplar superó los 5.000 años." },
      { nombre: "Canelo", cientifico: "Drimys winteri", estado: null, endemica: false,
        desc: "Árbol sagrado del pueblo mapuche, símbolo de paz y sabiduría." },
      { nombre: "Chilco", cientifico: "Fuchsia magellanica", estado: null, endemica: false,
        desc: "Arbusto de flores colgantes fucsia y morado, como pequeñas bailarinas." },
      { nombre: "Mañío macho", cientifico: "Podocarpus nubigenus", estado: null, endemica: false,
        desc: "Conífera de hojas punzantes que crece en suelos húmedos y fríos." }
    ],
    fauna: [
      { nombre: "Zorro de Darwin", cientifico: "Lycalopex fulvipes", estado: "En peligro", endemica: true,
        desc: "Pequeño zorro de bosque descrito por Darwin en Chiloé; uno de los cánidos más raros." },
      { nombre: "Ballena azul", cientifico: "Balaenoptera musculus", estado: "En peligro", endemica: false,
        desc: "El animal más grande que ha existido; se alimenta en el golfo Corcovado." },
      { nombre: "Pingüino de Magallanes", cientifico: "Spheniscus magellanicus", estado: "Preocupación menor", endemica: false,
        desc: "En Puñihuil, Chiloé, anida junto al pingüino de Humboldt." },
      { nombre: "Delfín chileno", cientifico: "Cephalorhynchus eutropia", estado: "Casi amenazada", endemica: true,
        desc: "El único cetáceo endémico de Chile, pequeño y de aleta redondeada." }
    ]
  },
  {
    id: "aysen", num: "XI", nombre: "Aysén", capital: "Coyhaique",
    color: "#2d6478",
    lema: "Patagonia de hielos y fiordos",
    desc: "Fiordos, glaciares y campos de hielo. La Carretera Austral cruza bosques intactos, y la laguna San Rafael guarda uno de los glaciares más cercanos al ecuador que llegan al mar.",
    ecosistemas: ["Campos de hielo", "Fiordos", "Bosque patagónico", "Estepa"],
    flora: [
      { nombre: "Ciprés de las Guaitecas", cientifico: "Pilgerodendron uviferum", estado: "Vulnerable", endemica: false,
        desc: "La conífera más austral del mundo, de madera imputrescible." },
      { nombre: "Lenga", cientifico: "Nothofagus pumilio", estado: null, endemica: false,
        desc: "Forma el límite del bosque en la montaña; en otoño se vuelve rojo fuego." },
      { nombre: "Coigüe de Magallanes", cientifico: "Nothofagus betuloides", estado: null, endemica: false,
        desc: "Siempreverde resistente a vientos y lluvias de los canales australes." },
      { nombre: "Chaura", cientifico: "Gaultheria mucronata", estado: null, endemica: false,
        desc: "Arbusto de bayas blancas, rosadas o rojas que alimentan a las aves." }
    ],
    fauna: [
      { nombre: "Huemul", cientifico: "Hippocamelus bisulcus", estado: "En peligro", endemica: false,
        desc: "Aysén es su principal refugio; protagoniza el escudo nacional junto al cóndor." },
      { nombre: "Martín pescador", cientifico: "Megaceryle torquata", estado: "Preocupación menor", endemica: false,
        desc: "Se lanza en picada desde una rama para capturar peces en ríos y lagos." },
      { nombre: "Huet-huet", cientifico: "Pteroptochos tarnii", estado: "Preocupación menor", endemica: false,
        desc: "Su canto da nombre a esta ave terrestre del sotobosque austral." },
      { nombre: "Delfín austral", cientifico: "Lagenorhynchus australis", estado: "Preocupación menor", endemica: false,
        desc: "Acrobático habitante de fiordos y canales patagónicos." }
    ]
  },
  {
    id: "magallanes", num: "XII", nombre: "Magallanes", capital: "Punta Arenas",
    color: "#3b5a86",
    lema: "El fin del mundo",
    desc: "Torres del Paine, el Estrecho de Magallanes, Tierra del Fuego y el Cabo de Hornos. Estepa, turberas y bosques subantárticos albergan la vida más austral del continente.",
    ecosistemas: ["Estepa patagónica", "Bosque subantártico", "Turberas", "Canales"],
    flora: [
      { nombre: "Calafate", cientifico: "Berberis microphylla", estado: null, endemica: false,
        desc: "Dice la leyenda: quien come calafate, vuelve a la Patagonia." },
      { nombre: "Ñirre", cientifico: "Nothofagus antarctica", estado: null, endemica: false,
        desc: "Árbol achaparrado y retorcido por el viento, de hojas pequeñas y onduladas." },
      { nombre: "Palomita", cientifico: "Codonorchis lessonii", estado: null, endemica: false,
        desc: "Delicada orquídea blanca del sotobosque magallánico." },
      { nombre: "Pompón", cientifico: "Sphagnum magellanicum", estado: null, endemica: false,
        desc: "Musgo formador de turberas, gigantescos almacenes de agua y carbono." }
    ],
    fauna: [
      { nombre: "Pingüino rey", cientifico: "Aptenodytes patagonicus", estado: "Preocupación menor", endemica: false,
        desc: "La única colonia continental de Sudamérica está en Bahía Inútil, Tierra del Fuego." },
      { nombre: "Guanaco", cientifico: "Lama guanicoe", estado: "Preocupación menor", endemica: false,
        desc: "Abundante en la estepa y en Torres del Paine, presa principal del puma." },
      { nombre: "Ñandú (choique)", cientifico: "Rhea pennata", estado: "Preocupación menor", endemica: false,
        desc: "Ave corredora de la estepa patagónica, puede superar los 60 km/h." },
      { nombre: "Canquén colorado", cientifico: "Chloephaga rubidiceps", estado: "En peligro", endemica: false,
        desc: "Ganso de cabeza canela cuya población continental es muy escasa." }
    ]
  }
];

/* =========================================================
   Reino Fungi: hongos y líquenes por región.
   "grupo" indica si es un hongo o un liquen (hongo asociado a un alga).
   Distribuciones referenciales: muchos hongos están poco estudiados en Chile.
   ========================================================= */
const FUNGI = {
  arica: [
    { nombre: "Liquen mapa", cientifico: "Rhizocarpon geographicum", grupo: "Liquen", estado: null, endemica: false,
      desc: "Forma manchas amarillo verdosas con bordes negros sobre las rocas del altiplano, como un mapa. Crece lentísimo y puede vivir miles de años." },
    { nombre: "Liquen naranja", cientifico: "Xanthoria elegans", grupo: "Liquen", estado: null, endemica: false,
      desc: "Tiñe de naranja intenso las rocas de alta montaña; resiste el frío extremo y la fuerte radiación solar." },
    { nombre: "Hongo del desierto", cientifico: "Podaxis pistillaris", grupo: "Hongo", estado: null, endemica: false,
      desc: "Uno de los pocos hongos capaces de vivir en el desierto: aparece tras lluvias escasas y guarda esporas negras." }
  ],
  tarapaca: [
    { nombre: "Líquenes de la camanchaca", cientifico: "Ramalina spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Cuelgan de rocas y cactus en oasis de niebla como Alto Patache, alimentándose del agua de la neblina." },
    { nombre: "Hongo del desierto", cientifico: "Podaxis pistillaris", grupo: "Hongo", estado: null, endemica: false,
      desc: "Sobrevive en suelos arenosos de la pampa, donde casi ningún otro hongo puede crecer." },
    { nombre: "Liquen naranja", cientifico: "Xanthoria elegans", grupo: "Liquen", estado: null, endemica: false,
      desc: "Coloniza las rocas de la precordillera y el altiplano de Tarapacá." }
  ],
  antofagasta: [
    { nombre: "Orchilla", cientifico: "Roccella spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Liquen de la costa neblinosa; de él se extraía antiguamente un tinte púrpura." },
    { nombre: "Liquen mapa", cientifico: "Rhizocarpon geographicum", grupo: "Liquen", estado: null, endemica: false,
      desc: "Cubre rocas en las alturas de San Pedro de Atacama; se usa para estimar la edad de superficies rocosas." },
    { nombre: "Hongo del desierto", cientifico: "Podaxis pistillaris", grupo: "Hongo", estado: null, endemica: false,
      desc: "Brota en el desierto más árido del mundo tras raras lluvias." }
  ],
  atacama: [
    { nombre: "Orchilla", cientifico: "Roccella spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Cubre rocas y arbustos de la costa de Pan de Azúcar, donde la camanchaca trae humedad." },
    { nombre: "Líquenes de la camanchaca", cientifico: "Ramalina spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Barbas grisáceas que crecen sobre cactus costeros como el copiapoa." },
    { nombre: "Hongo del desierto", cientifico: "Podaxis pistillaris", grupo: "Hongo", estado: null, endemica: false,
      desc: "Aparece en años de desierto florido, junto a la explosión de flores." }
  ],
  coquimbo: [
    { nombre: "Barba de viejo", cientifico: "Usnea spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Cuelga de los árboles del bosque de Fray Jorge, capturando la neblina; indica aire limpio." },
    { nombre: "Líquenes de la camanchaca", cientifico: "Ramalina spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Abundan en matorrales costeros bañados por la neblina." },
    { nombre: "Hongo del desierto", cientifico: "Podaxis pistillaris", grupo: "Hongo", estado: null, endemica: false,
      desc: "Presente en suelos secos del semiárido tras las lluvias de invierno." }
  ],
  valparaiso: [
    { nombre: "Hongo anaranjado", cientifico: "Anthracophyllum discolor", grupo: "Hongo", estado: null, endemica: false,
      desc: "Pequeño hongo de láminas anaranjadas que crece sobre ramas muertas de árboles nativos." },
    { nombre: "Barba de viejo", cientifico: "Usnea spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Cuelga de árboles y arbustos en quebradas húmedas de la costa." },
    { nombre: "Oreja de palo", cientifico: "Ganoderma australe", grupo: "Hongo", estado: null, endemica: false,
      desc: "Gran hongo en repisa sobre troncos; recicla la madera de árboles viejos." }
  ],
  metropolitana: [
    { nombre: "Hongo anaranjado", cientifico: "Anthracophyllum discolor", grupo: "Hongo", estado: null, endemica: false,
      desc: "Aparece en invierno sobre ramas caídas del bosque esclerófilo." },
    { nombre: "Cola de pavo", cientifico: "Trametes versicolor", grupo: "Hongo", estado: null, endemica: false,
      desc: "Hongo en repisa con anillos de colores; descompone la madera muerta." },
    { nombre: "Pedo de lobo", cientifico: "Lycoperdon perlatum", grupo: "Hongo", estado: null, endemica: false,
      desc: "Al madurar, libera una nube de esporas cuando se presiona." }
  ],
  ohiggins: [
    { nombre: "Oreja de palo", cientifico: "Ganoderma australe", grupo: "Hongo", estado: null, endemica: false,
      desc: "Crece por años sobre troncos vivos o muertos, formando repisas leñosas." },
    { nombre: "Cola de pavo", cientifico: "Trametes versicolor", grupo: "Hongo", estado: null, endemica: false,
      desc: "Común en ramas caídas de quebradas y bosques de la región." },
    { nombre: "Barba de viejo", cientifico: "Usnea spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Cuelga de robles y cipreses en la precordillera." }
  ],
  maule: [
    { nombre: "Digüeñe", cientifico: "Cyttaria espinosae", grupo: "Hongo", estado: null, endemica: false,
      desc: "Hongo comestible anaranjado que brota en primavera en ramas de roble; tradicional en la cocina mapuche y campesina." },
    { nombre: "Changle", cientifico: "Ramaria spp.", grupo: "Hongo", estado: null, endemica: false,
      desc: "Hongo con forma de coral, comestible, que se recolecta en otoño." },
    { nombre: "Hongo anaranjado", cientifico: "Anthracophyllum discolor", grupo: "Hongo", estado: null, endemica: false,
      desc: "Crece sobre ramas muertas en los bosques maulinos." }
  ],
  nuble: [
    { nombre: "Digüeñe", cientifico: "Cyttaria espinosae", grupo: "Hongo", estado: null, endemica: false,
      desc: "Sus esferas anaranjadas aparecen en robles en primavera y se comen frescas o en ensaladas." },
    { nombre: "Loyo", cientifico: "Boletus loyo", grupo: "Hongo", estado: null, endemica: true,
      desc: "Gran hongo de poros, comestible, que crece bajo robles y coigües. Endémico de Chile." },
    { nombre: "Morchella", cientifico: "Morchella spp.", grupo: "Hongo", estado: null, endemica: false,
      desc: "De sombrero alveolado como una esponja; muy apreciada en gastronomía." }
  ],
  biobio: [
    { nombre: "Changle", cientifico: "Ramaria spp.", grupo: "Hongo", estado: null, endemica: false,
      desc: "Ramificado como un coral; se recolecta en los bosques del Biobío tras las primeras lluvias." },
    { nombre: "Gargal", cientifico: "Grifola gargal", grupo: "Hongo", estado: null, endemica: false,
      desc: "Hongo comestible de aroma intenso que crece en troncos de roble." },
    { nombre: "Loyo", cientifico: "Boletus loyo", grupo: "Hongo", estado: null, endemica: true,
      desc: "Uno de los hongos silvestres más grandes de Chile; crece asociado a raíces de Nothofagus." }
  ],
  araucania: [
    { nombre: "Digüeñe", cientifico: "Cyttaria espinosae", grupo: "Hongo", estado: null, endemica: false,
      desc: "Símbolo de la primavera en La Araucanía; parasita ramas de roble y raulí." },
    { nombre: "Lengua de vaca", cientifico: "Fistulina antarctica", grupo: "Hongo", estado: null, endemica: false,
      desc: "Hongo carnoso y rojizo que crece sobre troncos de Nothofagus; su forma recuerda a una lengua." },
    { nombre: "Gargal", cientifico: "Grifola gargal", grupo: "Hongo", estado: null, endemica: false,
      desc: "Recolectado tradicionalmente por comunidades mapuche en otoño." }
  ],
  losrios: [
    { nombre: "Liquen de la selva", cientifico: "Pseudocyphellaria spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Grandes líquenes de hojas que cubren troncos de la selva valdiviana; aportan nitrógeno al bosque." },
    { nombre: "Lengua de vaca", cientifico: "Fistulina antarctica", grupo: "Hongo", estado: null, endemica: false,
      desc: "Brota en otoño sobre coigües y robles del bosque húmedo." },
    { nombre: "Oreja de palo", cientifico: "Ganoderma australe", grupo: "Hongo", estado: null, endemica: false,
      desc: "Recicla los grandes troncos caídos de la selva valdiviana." }
  ],
  loslagos: [
    { nombre: "Pan de indio", cientifico: "Cyttaria hariotii", grupo: "Hongo", estado: null, endemica: false,
      desc: "Esferas anaranjadas que brotan en ramas de lenga y coigüe; alimento ancestral de los pueblos del sur." },
    { nombre: "Liquen de Chiloé", cientifico: "Sticta spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Líquenes foliáceos de bosques muy húmedos, como los de Chiloé." },
    { nombre: "Oreja de palo", cientifico: "Ganoderma australe", grupo: "Hongo", estado: null, endemica: false,
      desc: "Forma grandes repisas en troncos de los bosques lluviosos." }
  ],
  aysen: [
    { nombre: "Morchella", cientifico: "Morchella spp.", grupo: "Hongo", estado: null, endemica: false,
      desc: "Brota en primavera, a veces en abundancia tras incendios; su recolección es una actividad importante en Aysén." },
    { nombre: "Pan de indio", cientifico: "Cyttaria hariotii", grupo: "Hongo", estado: null, endemica: false,
      desc: "Crece en las ramas de lengas y ñirres de la Patagonia." },
    { nombre: "Barba de viejo", cientifico: "Usnea spp.", grupo: "Liquen", estado: null, endemica: false,
      desc: "Cuelga de las lengas en bosques con aire muy puro." }
  ],
  magallanes: [
    { nombre: "Pan de indio de Darwin", cientifico: "Cyttaria darwinii", grupo: "Hongo", estado: null, endemica: false,
      desc: "Charles Darwin lo describió en Tierra del Fuego; los pueblos fueguinos lo consumían." },
    { nombre: "Pan de indio", cientifico: "Cyttaria hariotii", grupo: "Hongo", estado: null, endemica: false,
      desc: "Llamado también llao llao; deforma las ramas de los Nothofagus formando nudos." },
    { nombre: "Cortinarius magallánico", cientifico: "Cortinarius magellanicus", grupo: "Hongo", estado: null, endemica: false,
      desc: "Hongo de sombrero violáceo y viscoso, típico de los bosques de lenga y coigüe." }
  ]
};
REGIONES.forEach((r) => { r.fungi = FUNGI[r.id] || []; });

/* =========================================================
   Encuadre de las fotos en tarjetas y miniaturas.
   "X% Y%": punto que debe quedar visible (0% 0% = arriba a la izquierda).
   Para ajustar una foto: abre regiones/REGION.html?ajustar,
   haz clic sobre la especie y pega aquí la línea que aparece.
   ========================================================= */
const FOCOS = {
  "Browningia candelaris": "50% 15%",
  "Eulidia yarrellii": "50% 20%",
  "Hippocamelus antisensis": "50% 10%",
  "Echinopsis atacamensis": "50% 20%",
  "Geoffroea decorticans": "50% 15%",
  "Spheniscus humboldti": "50% 15%",
  "Jubaea chilensis": "50% 35%",
  "Nothofagus macrocarpa": "50% 30%",
  "Cyanoliseus patagonus bloxami": "50% 0%",
  "Berberidopsis corallina": "50% 70%",
  "Puma concolor": "50% 20%",
  "Strix rufipes": "50% 20%",
  "Araucaria araucana": "50% 5%",
  "Lapageria rosea": "50% 15%",
  "Spheniscus magellanicus": "50% 5%",
  "Aptenodytes patagonicus": "50% 0%",
  "Azorella compacta": "50% 75%"
};

/* =========================================================
   Fotos elegidas a mano: reemplazan la foto automática de Wikipedia
   cuando esa es un dibujo, no existe o es equivocada.
     commons: nombre del archivo en Wikimedia Commons
     inat:    foto de iNaturalist → [id de la foto, licencia, autor, extensión]
   Solo licencias libres (cc0, cc-by, cc-by-sa) o «no comercial» (cc-by-nc),
   que sirve mientras Lumaria no tenga fines de lucro.
   ========================================================= */
const FOTOS_ELEGIDAS = {
  "Telmatobius dankoi":            { inat: [81091244, "cc-by-nc", "Felipe Rabanal", "jpg"] },
  "Grifola gargal":                { inat: [403880366, "cc-by", "La florifunga", "jpeg"] },
  "Rhodophiala phycelloides":      { inat: [501511350, "cc-by", "Cesar Ormazabal", "jpg"] },
  "Peumus boldus":                 { inat: [691783911, "cc-by", "Gabriela Cartes", "jpg"] },
  "Cyanoliseus patagonus bloxami": { inat: [122450946, "cc-by", "felipejarafer", "jpg"] },
  "Berberidopsis corallina":       { inat: [354439144, "cc-by-nc", "Edgardo Flores", "jpeg"] },
  "Fuchsia magellanica":           { inat: [19330562, "cc-by", "Javier Conejeros Gastó", "jpg"] },
  "Berberis microphylla":          { inat: [113833284, "cc-by", "Nicolás Lavandero", "jpeg"] },
  "Roccella spp.":                 { commons: "Roccella gracilis - Flickr - pellaea.jpg" }
};
