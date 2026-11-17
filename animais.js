// Modelo de dados dos animais disponíveis para adoção.
// Cada chave é o identificador usado na URL: pag3.html?especie=<id>

const ANIMAIS = {
    peixepalhaco: {
        nome: 'Peixe-palhaço',
        nomeCientifico: 'AMPHIPRION OCELLARIS',
        status: 'VULNERÁVEL',
        statusClasse: 'status-vulneravel',
        imagem: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        habitat: 'Vive em <strong>recifes de coral</strong> e lagoas rasas, entre os tentáculos das anêmonas que o abrigam, em profundidades de 1 a 15 metros.',
        alimentacao: 'Onívoro: come <strong>zooplâncton</strong>, pequenos crustáceos e as algas que crescem junto à anêmona.',
        tamanho: 'Chega a <strong>11 cm</strong> de comprimento total — a fêmea é maior que o macho.',
        expectativaVida: 'Cerca de <strong>8 anos</strong> na natureza e mais de 12 anos em ambiente protegido.',
        biografia: 'O peixe-palhaço é um dos poucos animais imunes ao veneno das anêmonas: ele se cobre de muco e passa a viver entre os tentáculos, onde nenhum predador o alcança — e, em troca, defende a anêmona de peixes que tentam comê-la. Todos nascem machos e o indivíduo dominante do grupo se transforma em fêmea. Formam casais monogâmicos, e é o macho que guarda e ventila os ovos até a eclosão.'
    },

    cavalomarinho: {
        nome: 'Cavalo-marinho',
        nomeCientifico: 'HIPPOCAMPUS REIDI',
        status: 'VULNERÁVEL',
        statusClasse: 'status-vulneravel',
        imagem: 'https://images.unsplash.com/photo-1739648310673-1ed8f56c058f?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
        habitat: 'Habita <strong>manguezais, estuários</strong>, pradarias de ervas marinhas e recifes costeiros, até 55 metros de profundidade, sempre agarrado à vegetação pela cauda preênsil.',
        alimentacao: 'Carnívoro: captura <strong>zooplâncton</strong> — copépodes, anfípodes e pequenos camarões — sugando a presa pelo focinho tubular.',
        tamanho: 'Até <strong>18 cm</strong> de altura.',
        expectativaVida: 'Cerca de <strong>2,5 anos</strong> na natureza.',
        biografia: 'É o macho que engravida: a fêmea deposita os ovos na bolsa incubadora dele, que os carrega por cerca de duas semanas até o nascimento dos filhotes. Sem dentes e sem estômago, o cavalo-marinho passa o dia sugando presas minúsculas e depende da camuflagem para não ser visto. A perda dos manguezais e a captura para o aquarismo e para o comércio de lembranças são suas principais ameaças — por isso a espécie está no Apêndice II da CITES.'
    },

    tartarugamarinha: {
        nome: 'Tartaruga-marinha',
        nomeCientifico: 'CHELONIA MYDAS',
        status: 'CRÍTICO',
        statusClasse: 'status-critico',
        imagem: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        habitat: 'Ocupa <strong>águas tropicais e subtropicais</strong> de todos os oceanos: praias arenosas para a desova, mar aberto na fase juvenil e pradarias de ervas marinhas na fase adulta.',
        alimentacao: 'Herbívora na fase adulta: come <strong>algas e ervas marinhas</strong>. Os filhotes são onívoros e consomem pequenos invertebrados.',
        tamanho: 'Carapaça de cerca de <strong>1,15 m</strong> e até 230 kg.',
        expectativaVida: 'Vive <strong>décadas</strong> — só atinge a maturidade sexual entre 20 e 50 anos.',
        biografia: 'A tartaruga-verde deve o nome à cor esverdeada da gordura do corpo. Ela atravessa milhares de quilômetros entre a área de alimentação e a praia onde nasceu, para desovar sempre no mesmo lugar. Cada fêmea põe cerca de 125 ovos por ninho, várias vezes na temporada — mas estima-se que menos de um em cada mil filhotes chegue à idade adulta. A captura incidental em redes de pesca e a degradação das praias de desova são as maiores ameaças.'
    },

    polvo: {
        nome: 'Polvo',
        nomeCientifico: 'OCTOPUS VULGARIS',
        status: 'ESTÁVEL',
        statusClasse: 'status-estavel',
        imagem: 'https://images.unsplash.com/photo-1628944681206-2ee8d63b0a6b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
        habitat: 'Vive em <strong>zonas abissais</strong>, escondido em fendas e cavernas do fundo do mar.',
        alimentacao: 'Carnívoro: come caranguejos, camarões, moluscos e peixes pequenos.',
        tamanho: 'Pode atingir até <strong>5 metros</strong> com os braços estendidos.',
        expectativaVida: 'De <strong>1 a 2 anos</strong> na natureza — um dos ciclos mais curtos entre os cefalópodes.',
        biografia: 'O polvo tem três corações, sangue azul e um cérebro em cada um dos oito braços, além do central. Muda de cor e de textura da pele em segundos para se confundir com o fundo, solta uma nuvem de tinta para escapar e consegue regenerar um braço perdido. É um dos invertebrados mais inteligentes do oceano: resolve labirintos, abre potes e usa conchas como abrigo. Depois da reprodução, macho e fêmea morrem — a fêmea fica guardando os ovos sem se alimentar até a eclosão.'
    },

    arraia: {
        nome: 'Arraia',
        nomeCientifico: 'DASYATIDAE',
        status: 'VULNERÁVEL',
        statusClasse: 'status-vulneravel',
        imagem: 'https://images.unsplash.com/photo-1560364897-12528532f1c6?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        habitat: 'Fundos <strong>arenosos e lodosos</strong> de águas costeiras rasas, onde se enterra parcialmente para se camuflar.',
        alimentacao: 'Carnívora: bivalves, camarões, caranguejos, vermes marinhos e peixes pequenos.',
        tamanho: 'De <strong>30 cm a mais de 2 m</strong> de envergadura, conforme a espécie.',
        expectativaVida: 'Entre <strong>15 e 25 anos</strong>.',
        biografia: 'A arraia é um peixe cartilaginoso, como o tubarão: o esqueleto é de cartilagem, e não de osso. Respira pelos espiráculos no dorso enquanto fica enterrada na areia, o que a deixa praticamente invisível para presas e predadores. O ferrão serrilhado na base da cauda serve só para defesa, quando é pisada ou encurralada. A reprodução é lenta — poucos filhotes por ano, já nascidos formados —, o que torna as populações vulneráveis à pesca e à degradação do fundo do mar.'
    },

    baleia: {
        nome: 'Baleia',
        nomeCientifico: 'MEGAPTERA NOVAEANGLIAE',
        status: 'AMEAÇADO',
        statusClasse: 'status-critico',
        imagem: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        habitat: 'Circula por <strong>todos os oceanos</strong>: alimenta-se em águas frias, perto dos polos, e migra para águas tropicais para se reproduzir.',
        alimentacao: 'Filtra <strong>krill</strong> e pequenos peixes de cardume pelas barbatanas, engolindo grandes volumes de água e devolvendo-a pela boca.',
        tamanho: 'Até <strong>16 metros</strong> e cerca de 40 toneladas.',
        expectativaVida: 'Cerca de <strong>80 a 90 anos</strong>.',
        biografia: 'A jubarte é conhecida pelos saltos e pelas nadadeiras peitorais, que podem chegar a um terço do comprimento do corpo. Os machos cantam frases que se repetem em canções de até meia hora, ouvidas a quilômetros de distância. A face inferior da cauda tem um padrão de branco e preto exclusivo de cada indivíduo, o que permite identificá-lo como uma impressão digital. A população que se reproduz no Brasil viaja quase 9.000 km até a Antártida para se alimentar — e voltou a crescer depois da proibição da caça comercial.'
    }
};
