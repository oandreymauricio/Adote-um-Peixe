// Gerador puro em JavaScript de E-book PDF (PDF 1.4, padrão A4, ~15 páginas)
// Compatível com navegador (window) e Node.js (module.exports) para testes automatizados.

(function (globalScope) {
    const LARGURA_A4 = 595.28;
    const ALTURA_A4 = 841.89;
    const MARGEM_ESQ = 52;
    const MARGEM_DIR = 52;
    const LARGURA_UTIL = LARGURA_A4 - MARGEM_ESQ - MARGEM_DIR;
    const Y_MINIMO_RODAPE = 68;

    const WINANSI_EXTRAS = {
        0x20AC: 0x80, // €
        0x201A: 0x82, // ‚
        0x201E: 0x84, // „
        0x2026: 0x85, // …
        0x2018: 0x91, // ‘
        0x2019: 0x92, // ’
        0x201C: 0x93, // “
        0x201D: 0x94, // ”
        0x2022: 0x95, // •
        0x2013: 0x96, // –
        0x2014: 0x97, // —
        0x2122: 0x99  // ™
    };

    function limparTextoPdf(texto) {
        return String(texto == null ? '' : texto)
            .replace(/<\/?strong>/gi, '')
            .replace(/\r\n/g, '\n')
            .replace(/[\uD800-\uDFFF]/g, '')
            .trim();
    }

    function codificarWinAnsiBytes(texto) {
        const limpo = String(texto == null ? '' : texto);
        const bytes = [];
        for (let i = 0; i < limpo.length; i++) {
            const code = limpo.charCodeAt(i);
            let b = null;
            if (code >= 0x20 && code <= 0x7E) {
                b = code;
            } else if (code >= 0xA0 && code <= 0xFF) {
                b = code;
            } else if (WINANSI_EXTRAS[code] !== undefined) {
                b = WINANSI_EXTRAS[code];
            } else if (code === 0x09 || code === 0x0A) {
                b = 0x20;
            }

            if (b !== null) {
                if (b === 0x28 || b === 0x29 || b === 0x5C) {
                    bytes.push(0x5C); // '\'
                }
                bytes.push(b);
            }
        }
        return bytes;
    }

    function larguraCaractere(ch, negrito) {
        const fatorNegrito = negrito ? 1.07 : 1.0;
        if ('iljtfr.,:;!|\'"()[] '.indexOf(ch) !== -1) return 0.30 * fatorNegrito;
        if ('mwMW@#%&QOG'.indexOf(ch) !== -1) return 0.78 * fatorNegrito;
        if (ch >= 'A' && ch <= 'Z') return 0.65 * fatorNegrito;
        if (ch >= '0' && ch <= '9') return 0.56 * fatorNegrito;
        return 0.52 * fatorNegrito;
    }

    function medirTexto(texto, tamanhoFonte, negrito) {
        let soma = 0;
        for (let i = 0; i < texto.length; i++) {
            soma += larguraCaractere(texto[i], negrito);
        }
        return soma * tamanhoFonte;
    }

    function quebrarLinhas(texto, tamanhoFonte, larguraMax, negrito) {
        const limpo = limparTextoPdf(texto);
        if (!limpo) return [];
        const paragrafos = limpo.split(/\n+/);
        const resultado = [];

        paragrafos.forEach((par, idx) => {
            const palavras = par.trim().split(/\s+/).filter(Boolean);
            let linhaAtual = '';

            palavras.forEach(palavra => {
                const candidata = linhaAtual ? (linhaAtual + ' ' + palavra) : palavra;
                if (medirTexto(candidata, tamanhoFonte, negrito) <= larguraMax) {
                    linhaAtual = candidata;
                } else {
                    if (linhaAtual) resultado.push(linhaAtual);
                    // Quebra palavras muito longas se necessário
                    if (medirTexto(palavra, tamanhoFonte, negrito) > larguraMax) {
                        let pedaco = '';
                        for (let i = 0; i < palavra.length; i++) {
                            const prox = pedaco + palavra[i];
                            if (medirTexto(prox, tamanhoFonte, negrito) > larguraMax && pedaco) {
                                resultado.push(pedaco);
                                pedaco = palavra[i];
                            } else {
                                pedaco = prox;
                            }
                        }
                        linhaAtual = pedaco;
                    } else {
                        linhaAtual = palavra;
                    }
                }
            });

            if (linhaAtual) resultado.push(linhaAtual);
            if (idx < paragrafos.length - 1) resultado.push('');
        });

        return resultado;
    }

    function fallbackEbook(animal) {
        const nome = animal.nome || 'Espécie Aquática';
        const cientifico = animal.nomeCientifico || 'Espécie em estudo';
        const ambiente = animal.ambiente || 'Ambiente aquático';
        const ficha = animal.ficha || {};
        return {
            taxonomia: {
                reino: 'Animalia',
                filo: 'Chordata',
                classe: 'Fauna Aquática',
                ordem: 'Classificação ecológica do catálogo',
                familia: cientifico,
                genero: cientifico.split(' ')[0] || nome,
                nomeComumIngles: nome
            },
            resumoExecutivo: animal.biografia ||
                ('O ' + nome + ' (' + cientifico + ') habita áreas de ' + ambiente.toLowerCase() + ' e cumpre papel fundamental no equilíbrio ecológico de sua região.'),
            historias: [
                'Pesquisadores e comunidades costeiras ou ribeirinhas acompanham o ' + nome + ' como indicador natural da saúde das águas onde vive. A preservação de seus ciclos de vida depende da integridade dos habitats de ' + ambiente.toLowerCase() + '.',
                animal.biografia || 'Observações em campo mostram adaptações notáveis para alimentação, deslocamento e proteção ao longo de todo o seu ciclo de vida.'
            ],
            evolucao: {
                origemGeologica: 'Linhagem adaptada ao ambiente ' + ambiente.toLowerCase() + ' ao longo de milhões de anos de seleção natural em ecossistemas aquáticos.',
                historiaEvolutiva: 'Ao longo de sua trajetória evolutiva, o ' + nome + ' desenvolveu características morfológicas e fisiológicas específicas para explorar recursos de ' + (ficha.habitat || ambiente) + ' e responder às variações naturais de temperatura, correnteza e disponibilidade de alimento.',
                adaptacoesChave: [
                  'Adaptação estrutural e hidrodinâmica ao ambiente ' + ambiente.toLowerCase() + '.',
                  'Estratégia alimentar alinhada à dieta descrita: ' + (ficha.alimentacao || 'recursos naturais locais') + '.',
                  'Ciclo biológico ajustado à expectativa média de vida (' + (ficha.expectativaVida || 'variável') + ').'
                ]
            },
            especiesProximas: {
                introducao: 'O ' + nome + ' integra grupos aquáticos que compartilham adaptações anatômicas e ecológicas semelhantes em oceanos ou rios.',
                parentes: [
                    { nome: 'Espécies irmãs do grupo ' + cientifico, nomeCientifico: cientifico, diferenca: 'Compartilham traços evolutivos e nicho ecológico semelhante.' },
                    { nome: 'Fauna associada de ' + ambiente, nomeCientifico: 'Ecossistema associado', diferenca: 'Ocupam habitats próximos e interagem na mesma cadeia alimentar.' }
                ]
            },
            habitatEcossistema: {
                distribuicaoGeografica: 'Presente em zonas compatíveis com o ambiente ' + ambiente.toLowerCase() + '.',
                condicoesAmbientais: ficha.habitat || ('Habita áreas características de ' + ambiente.toLowerCase() + '.'),
                interacoesEcologicas: 'Mantém interações vitais com presas, predadores e habitats estruturantes locais.'
            },
            comoVivem: {
                comportamentoSocial: 'Apresenta organização social e uso de território compatíveis com a proteção contra predadores e busca eficiente de alimento.',
                rotinaEMigracao: 'Alterna períodos de forrageamento ativo e repouso conforme ciclos diários, marés e estações reprodutivas.',
                comunicacaoESentidos: 'Utiliza sentidos especializados na percepção de luz, movimento, vibração ou sinais químicos na água.'
            },
            reproducao: {
                maturidadeECortejo: 'O ciclo reprodutivo depende de águas limpas e abrigos preservados para cortejo e formação de novos indivíduos.',
                gestacaoOuDesova: 'A reprodução acompanha condições sazonais favoráveis de temperatura e oferta de alimento para a prole.',
                cuidadoParental: 'A sobrevivência inicial dos jovens depende diretamente da proteção das áreas de berçário.'
            },
            alimentacaoDetalhada: {
                dietaPorFase: ficha.alimentacao || 'Dieta ajustada à disponibilidade de recursos em cada estágio de crescimento.',
                tecnicasDeCaptura: 'Emprega técnicas especializadas compatíveis com seu porte (' + (ficha.tamanho || 'variável') + ') e habitat.',
                papelTrofico: 'Contribui para o fluxo de energia e controle equilibrado das populações na teia alimentar.'
            },
            defesa: {
                mecanismosDeProtecao: 'Utiliza camuflagem, refúgios naturais do habitat ou respostas rápidas de fuga diante de ameaças.',
                predadoresNaturais: 'Está sujeito a predadores naturais típicos de seu ambiente, mantendo equilíbrio populacional.',
                estrategiasComportamentais: 'Busca abrigo em estruturas do ecossistema e evita exposição desnecessária.'
            },
            ameacasDetalhes: {
                panoramaAtual: animal.motivoAmeaca || 'Enfrenta pressões ligadas à degradação do habitat e atividades humanas.',
                fatoresCriticos: [
                    animal.motivoAmeaca || 'Alterações na qualidade da água e degradação de habitats naturais.',
                    'Poluição por plásticos, sedimentos ou resíduos químicos.',
                    'Pressão de captura sem manejo sustentável ou perda de áreas de reprodução.'
                ]
            },
            conservacaoAcoes: {
                comoADoacaoAjuda: animal.porqueAdotar || 'Sua doação apoia pesquisas de campo, monitoramento e preservação do habitat desta espécie.',
                frentesDeTrabalho: [
                    'Monitoramento populacional e estudos científicos em campo.',
                    'Recuperação e vigilância de habitats de ' + ambiente.toLowerCase() + '.',
                    'Educação ambiental junto a comunidades locais e visitantes.'
                ],
                boasPraticasApoiador: [
                    'Reduza o consumo de plásticos descartáveis e descarte resíduos corretamente.',
                    'Valorize projetos científicos e turismo ecológico responsável.',
                    'Compartilhe conhecimento sobre a conservação das águas.'
                ]
            },
            curiosidadesExtras: [
                animal.biografia || ('O ' + nome + ' possui características únicas adaptadas ao ambiente ' + ambiente.toLowerCase() + '.'),
                'Porte típico registrado: ' + (ficha.tamanho || 'variável conforme idade e região') + '.',
                'Expectativa de vida: ' + (ficha.expectativaVida || 'dependente da preservação do habitat') + '.'
            ]
        };
    }

    function montarDadosCompletos(animalBruto, ebookExtra, doacaoInfo) {
        const animal = animalBruto || {};
        const fallback = fallbackEbook(animal);
        const extra = ebookExtra && typeof ebookExtra === 'object' ? ebookExtra : {};
        return {
            animal: {
                id: animal.id || 'especie',
                nome: animal.nome || 'Espécie Aquática',
                nomeCientifico: animal.nomeCientifico || 'Não informado',
                status: animal.status || 'ESTÁVEL',
                ambiente: animal.ambiente || 'Oceano aberto',
                ficha: animal.ficha || {},
                biografia: animal.biografia || '',
                motivoAmeaca: animal.motivoAmeaca || '',
                porqueAdotar: animal.porqueAdotar || ''
            },
            extra: {
                taxonomia: Object.assign({}, fallback.taxonomia, extra.taxonomia || {}),
                resumoExecutivo: extra.resumoExecutivo || fallback.resumoExecutivo,
                historias: Array.isArray(extra.historias) && extra.historias.length ? extra.historias : fallback.historias,
                evolucao: Object.assign({}, fallback.evolucao, extra.evolucao || {}),
                especiesProximas: Object.assign({}, fallback.especiesProximas, extra.especiesProximas || {}),
                habitatEcossistema: Object.assign({}, fallback.habitatEcossistema, extra.habitatEcossistema || {}),
                comoVivem: Object.assign({}, fallback.comoVivem, extra.comoVivem || {}),
                reproducao: Object.assign({}, fallback.reproducao, extra.reproducao || {}),
                alimentacaoDetalhada: Object.assign({}, fallback.alimentacaoDetalhada, extra.alimentacaoDetalhada || {}),
                defesa: Object.assign({}, fallback.defesa, extra.defesa || {}),
                ameacasDetalhes: Object.assign({}, fallback.ameacasDetalhes, extra.ameacasDetalhes || {}),
                conservacaoAcoes: Object.assign({}, fallback.conservacaoAcoes, extra.conservacaoAcoes || {}),
                curiosidadesExtras: Array.isArray(extra.curiosidadesExtras) && extra.curiosidadesExtras.length
                    ? extra.curiosidadesExtras
                    : fallback.curiosidadesExtras
            },
            doacao: {
                apoiadorNome: (doacaoInfo && doacaoInfo.apoiadorNome) || 'Apoiador(a) do Oceano',
                apoiadorEmail: (doacaoInfo && doacaoInfo.apoiadorEmail) || 'E-mail cadastrado',
                valorTexto: (doacaoInfo && doacaoInfo.valorTexto) || 'Contribuição confirmada',
                dataTexto: (doacaoInfo && doacaoInfo.dataTexto) || new Date().toLocaleDateString('pt-BR'),
                codigoCertificado: (doacaoInfo && doacaoInfo.codigoCertificado) || ('ADP-' + Date.now().toString().slice(-6))
            }
        };
    }

    function criarPaginaCanvas() {
        const ops = [];

        function corTexto(r, g, b) {
            ops.push(r.toFixed(3) + ' ' + g.toFixed(3) + ' ' + b.toFixed(3) + ' rg');
        }
        function corPreenchimento(r, g, b) {
            ops.push(r.toFixed(3) + ' ' + g.toFixed(3) + ' ' + b.toFixed(3) + ' rg');
        }
        function corContorno(r, g, b) {
            ops.push(r.toFixed(3) + ' ' + g.toFixed(3) + ' ' + b.toFixed(3) + ' RG');
        }
        function retangulo(x, yBase, w, h, preencher, contornar) {
            ops.push(x.toFixed(2) + ' ' + yBase.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re');
            if (preencher && contornar) ops.push('B');
            else if (preencher) ops.push('f');
            else if (contornar) ops.push('S');
        }
        function textoSimples(x, y, tamanho, fonteKey, texto, r, g, b) {
            const bytes = codificarWinAnsiBytes(texto);
            let literal = '';
            for (let i = 0; i < bytes.length; i++) {
                literal += String.fromCharCode(bytes[i]);
            }
            corTexto(r, g, b);
            ops.push('BT');
            ops.push('/' + fonteKey + ' ' + tamanho.toFixed(1) + ' Tf');
            ops.push(x.toFixed(2) + ' ' + y.toFixed(2) + ' Td');
            ops.push('(' + literal + ') Tj');
            ops.push('ET');
        }
        function desenharBlocoTexto(opts) {
            const x = opts.x != null ? opts.x : MARGEM_ESQ;
            let y = opts.y;
            const tamanho = opts.tamanho || 10.5;
            const entrelinha = opts.entrelinha || (tamanho * 1.45);
            const largura = opts.largura || LARGURA_UTIL;
            const fonte = opts.fonte || 'F1';
            const negrito = fonte === 'F2';
            const cor = opts.cor || [0.15, 0.21, 0.29];
            const yLimite = opts.yLimite || Y_MINIMO_RODAPE;

            const linhas = quebrarLinhas(opts.texto, tamanho, largura, negrito);
            for (let i = 0; i < linhas.length; i++) {
                if (y < yLimite) break;
                const linha = linhas[i];
                if (linha === '') {
                    y -= entrelinha * 0.55;
                    continue;
                }
                textoSimples(x, y, tamanho, fonte, linha, cor[0], cor[1], cor[2]);
                y -= entrelinha;
            }
            return y;
        }
        function medirAlturaBloco(texto, tamanho, entrelinha, largura, negrito) {
            const linhas = quebrarLinhas(texto, tamanho, largura, negrito);
            let h = 0;
            linhas.forEach(l => {
                h += (l === '') ? entrelinha * 0.55 : entrelinha;
            });
            return h;
        }
        function desenharCaixa(opts) {
            const x = opts.x != null ? opts.x : MARGEM_ESQ;
            const largura = opts.largura || LARGURA_UTIL;
            const padX = opts.padX || 14;
            const padY = opts.padY || 12;
            const titulo = opts.titulo || '';
            const texto = opts.texto || '';
            const tamTexto = opts.tamanho || 10;
            const entrelinha = opts.entrelinha || 14.5;
            const alturaTitulo = titulo ? 17 : 0;
            const alturaTexto = texto ? medirAlturaBloco(texto, tamTexto, entrelinha, largura - padX * 2, false) : 0;
            const alturaTotal = Math.max(opts.alturaMin || 0, padY * 2 + alturaTitulo + alturaTexto);
            const yTopo = opts.yTopo;
            const yBase = yTopo - alturaTotal;

            if (yBase < Y_MINIMO_RODAPE) {
                return yTopo;
            }

            const fundo = opts.fundo || [0.94, 0.97, 0.99];
            const borda = opts.borda || [0.78, 0.87, 0.94];
            corPreenchimento(fundo[0], fundo[1], fundo[2]);
            corContorno(borda[0], borda[1], borda[2]);
            ops.push('0.8 w');
            retangulo(x, yBase, largura, alturaTotal, true, true);

            if (opts.barraEsquerda) {
                const bar = opts.barraEsquerda;
                corPreenchimento(bar[0], bar[1], bar[2]);
                retangulo(x, yBase, 4, alturaTotal, true, false);
            }

            let yCursor = yTopo - padY - 9;
            if (titulo) {
                const corTit = opts.corTitulo || [0.043, 0.224, 0.329];
                textoSimples(x + padX, yCursor, 10.5, 'F2', titulo, corTit[0], corTit[1], corTit[2]);
                yCursor -= 17;
            }
            if (texto) {
                desenharBlocoTexto({
                    x: x + padX,
                    y: yCursor,
                    largura: largura - padX * 2,
                    tamanho: tamTexto,
                    entrelinha: entrelinha,
                    texto: texto,
                    cor: opts.corTexto || [0.16, 0.23, 0.31],
                    yLimite: yBase + 4
                });
            }
            return yBase - 12;
        }
        function desenharCabecalhoCapitulo(numCap, tituloCap, subtituloCap, nomeEspecie, numPagina, totalPaginas) {
            // Cabeçalho contínuo
            corPreenchimento(0.043, 0.224, 0.329);
            retangulo(0, ALTURA_A4 - 44, LARGURA_A4, 44, true, false);
            textoSimples(MARGEM_ESQ, ALTURA_A4 - 27, 9, 'F2', 'ADOTE UM PEIXE  |  MONOGRAFIA DA ESPÉCIE', 0.50, 0.83, 1.0);
            const nomeLarg = medirTexto(nomeEspecie.toUpperCase(), 9, true);
            textoSimples(LARGURA_A4 - MARGEM_DIR - nomeLarg, ALTURA_A4 - 27, 9, 'F2', nomeEspecie.toUpperCase(), 1, 1, 1);

            // Rodapé contínuo
            corContorno(0.80, 0.86, 0.92);
            ops.push('0.7 w');
            ops.push(MARGEM_ESQ + ' 46 m ' + (LARGURA_A4 - MARGEM_DIR) + ' 46 l S');
            textoSimples(MARGEM_ESQ, 30, 8.5, 'F1', 'Projeto Adote um Peixe · Material exclusivo do apoiador', 0.38, 0.45, 0.54);
            const pagStr = 'Página ' + numPagina + ' de ' + totalPaginas;
            const pagLarg = medirTexto(pagStr, 8.5, true);
            textoSimples(LARGURA_A4 - MARGEM_DIR - pagLarg, 30, 8.5, 'F2', pagStr, 0.043, 0.224, 0.329);

            // Título do capítulo
            let y = ALTURA_A4 - 78;
            if (numCap) {
                textoSimples(MARGEM_ESQ, y, 9.5, 'F2', numCap.toUpperCase(), 0.125, 0.698, 0.667);
                y -= 24;
            }
            y = desenharBlocoTexto({
                x: MARGEM_ESQ,
                y: y,
                largura: LARGURA_UTIL,
                tamanho: 19,
                entrelinha: 23,
                fonte: 'F2',
                texto: tituloCap,
                cor: [0.043, 0.224, 0.329]
            });
            if (subtituloCap) {
                y = desenharBlocoTexto({
                    x: MARGEM_ESQ,
                    y: y - 2,
                    largura: LARGURA_UTIL,
                    tamanho: 10.5,
                    entrelinha: 14,
                    fonte: 'F3',
                    texto: subtituloCap,
                    cor: [0.32, 0.40, 0.49]
                });
            }
            corPreenchimento(0.125, 0.698, 0.667);
            retangulo(MARGEM_ESQ, y - 6, 72, 3, true, false);
            return y - 24;
        }
        function desenharSecao(y, titulo, corpo) {
            if (y < Y_MINIMO_RODAPE + 30) return y;
            const yNovo = desenharBlocoTexto({
                x: MARGEM_ESQ,
                y: y,
                largura: LARGURA_UTIL,
                tamanho: 12,
                entrelinha: 16,
                fonte: 'F2',
                texto: titulo,
                cor: [0.043, 0.224, 0.329]
            });
            return desenharBlocoTexto({
                x: MARGEM_ESQ,
                y: yNovo - 3,
                largura: LARGURA_UTIL,
                tamanho: 10.5,
                entrelinha: 15,
                fonte: 'F1',
                texto: corpo,
                cor: [0.16, 0.22, 0.30]
            }) - 10;
        }
        function desenharLista(y, itens) {
            let cursor = y;
            (itens || []).forEach((item, idx) => {
                if (cursor < Y_MINIMO_RODAPE + 20) return;
                corPreenchimento(0.125, 0.698, 0.667);
                retangulo(MARGEM_ESQ + 2, cursor + 2, 5, 5, true, false);
                cursor = desenharBlocoTexto({
                    x: MARGEM_ESQ + 14,
                    y: cursor,
                    largura: LARGURA_UTIL - 14,
                    tamanho: 10.2,
                    entrelinha: 14.5,
                    fonte: 'F1',
                    texto: item,
                    cor: [0.16, 0.22, 0.30]
                }) - 4;
                if (idx === itens.length - 1) cursor -= 4;
            });
            return cursor;
        }

        return {
            ops,
            corPreenchimento,
            corContorno,
            retangulo,
            textoSimples,
            desenharBlocoTexto,
            desenharCaixa,
            desenharCabecalhoCapitulo,
            desenharSecao,
            desenharLista
        };
    }

    function construirPaginasEbook(animalBruto, ebookExtra, doacaoInfo) {
        const dados = montarDadosCompletos(animalBruto, ebookExtra, doacaoInfo);
        const a = dados.animal;
        const ex = dados.extra;
        const d = dados.doacao;
        const totalPaginas = 15;
        const paginas = [];

        // === PÁGINA 1: CAPA ===
        {
            const p = criarPaginaCanvas();
            p.corPreenchimento(0.043, 0.224, 0.329);
            p.retangulo(0, ALTURA_A4 - 270, LARGURA_A4, 270, true, false);
            p.corPreenchimento(0.125, 0.698, 0.667);
            p.retangulo(0, ALTURA_A4 - 278, LARGURA_A4, 8, true, false);

            p.textoSimples(MARGEM_ESQ, ALTURA_A4 - 64, 11, 'F2', 'ADOTE UM PEIXE  ·  COLEÇÃO DE CONSERVAÇÃO AQUÁTICA', 0.50, 0.83, 1.0);
            p.textoSimples(MARGEM_ESQ, ALTURA_A4 - 92, 10, 'F1', 'E-BOOK EXCLUSIVO DO APOIADOR  |  EDIÇÃO COMPLETA (15 PÁGINAS)', 0.86, 0.93, 0.98);

            let yCapa = p.desenharBlocoTexto({
                x: MARGEM_ESQ,
                y: ALTURA_A4 - 144,
                largura: LARGURA_UTIL,
                tamanho: 30,
                entrelinha: 35,
                fonte: 'F2',
                texto: a.nome,
                cor: [1, 1, 1]
            });
            p.desenharBlocoTexto({
                x: MARGEM_ESQ,
                y: yCapa - 4,
                largura: LARGURA_UTIL,
                tamanho: 15,
                entrelinha: 20,
                fonte: 'F3',
                texto: a.nomeCientifico + '  ·  ' + (ex.taxonomia.nomeComumIngles || ''),
                cor: [0.74, 0.93, 0.96]
            });

            // Faixa de status e ambiente
            let yCorpo = ALTURA_A4 - 320;
            p.desenharCaixa({
                yTopo: yCorpo,
                titulo: 'CLASSIFICAÇÃO E AMBIENTE NO PROJETO',
                texto: 'Nível de ameaça registrado: ' + a.status + '   |   Ambiente principal: ' + a.ambiente + '\nFilo: ' + ex.taxonomia.filo + '   |   Classe: ' + ex.taxonomia.classe + '   |   Família: ' + ex.taxonomia.familia,
                fundo: [0.94, 0.97, 0.99],
                borda: [0.76, 0.86, 0.93],
                barraEsquerda: [0.114, 0.435, 0.647]
            });

            yCorpo -= 100;
            yCorpo = p.desenharBlocoTexto({
                x: MARGEM_ESQ,
                y: yCorpo,
                largura: LARGURA_UTIL,
                tamanho: 13,
                entrelinha: 18,
                fonte: 'F2',
                texto: 'Sobre esta monografia',
                cor: [0.043, 0.224, 0.329]
            });
            yCorpo = p.desenharBlocoTexto({
                x: MARGEM_ESQ,
                y: yCorpo - 4,
                largura: LARGURA_UTIL,
                tamanho: 10.8,
                entrelinha: 16,
                fonte: 'F1',
                texto: ex.resumoExecutivo,
                cor: [0.16, 0.22, 0.30]
            });

            // Caixa de dedicatória personalizada
            p.desenharCaixa({
                yTopo: 245,
                alturaMin: 128,
                titulo: 'EDIÇÃO DEDICADA AO APOIADOR',
                texto: 'Apoiador(a): ' + d.apoiadorNome + ' (' + d.apoiadorEmail + ')\nEspécie apadrinhada: ' + a.nome + ' (' + a.nomeCientifico + ')\nContribuição confirmada: ' + d.valorTexto + '   ·   Data: ' + d.dataTexto + '\nRegistro de adoção simbólica: ' + d.codigoCertificado,
                fundo: [0.94, 0.99, 0.98],
                borda: [0.75, 0.93, 0.89],
                barraEsquerda: [0.125, 0.698, 0.667],
                entrelinha: 16
            });

            p.textoSimples(MARGEM_ESQ, 44, 9, 'F1', 'Projeto Acadêmico de Programação Web · CEFET-MG Timóteo · Educação e Preservação dos Oceanos', 0.38, 0.45, 0.54);
            p.textoSimples(LARGURA_A4 - MARGEM_DIR - 62, 44, 9, 'F2', 'Página 1 de 15', 0.043, 0.224, 0.329);
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 2: SUMÁRIO E AGRADECIMENTO ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Apresentação', 'Sumário da Obra e Mensagem ao Apoiador', 'Guia completo dos 13 capítulos desta edição especial.', a.nome, 2, totalPaginas);

            y = p.desenharCaixa({
                yTopo: y,
                titulo: 'OBRIGADO POR INVESTIR NA VIDA AQUÁTICA',
                texto: 'Olá, ' + d.apoiadorNome + '! Este e-book foi gerado especialmente após a confirmação da sua contribuição de ' + d.valorTexto + ' para o ' + a.nome + '. Nas próximas páginas você encontrará histórias reais, origens evolutivas, parentes mais próximos, comportamento, reprodução, alimentação, defesas naturais e ações de conservação.',
                barraEsquerda: [0.125, 0.698, 0.667]
            });

            const sumario = [
                'Página 1  — Capa e Dedicatória do Apoiador',
                'Página 2  — Sumário da Obra e Apresentação',
                'Página 3  — Cap. 1: Identidade Biológica, Taxonomia e Ficha Técnica',
                'Página 4  — Cap. 2: Crônicas, Lendas e Histórias de Campo',
                'Página 5  — Cap. 3: Linhagem Evolutiva e Adaptações Históricas',
                'Página 6  — Cap. 4: Espécies Mais Próximas e Parentesco Evolutivo',
                'Página 7  — Cap. 5: Habitat, Distribuição Geográfica e Ecossistema',
                'Página 8  — Cap. 6: Como Vivem: Organização Social, Rotina e Sentidos',
                'Página 9  — Cap. 7: Ciclo de Vida, Cortejo e Reprodução',
                'Página 10 — Cap. 8: Estratégias de Alimentação e Teia Trófica',
                'Página 11 — Cap. 9: Mecanismos de Defesa, Predadores e Sobrevivência',
                'Página 12 — Cap. 10: Ameaças Atuais e Riscos à Espécie',
                'Página 13 — Cap. 11: Por Que Adotar e Frentes de Conservação',
                'Página 14 — Cap. 12: Curiosidades Científicas e Fatos Surpreendentes',
                'Página 15 — Cap. 13: Guia de Boas Práticas e Certificado de Adoção'
            ];
            y = p.desenharBlocoTexto({ x: MARGEM_ESQ, y: y - 4, tamanho: 12, entrelinha: 16, fonte: 'F2', texto: 'Estrutura dos capítulos', cor: [0.043, 0.224, 0.329] });
            p.desenharLista(y - 4, sumario);
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 3: CAPÍTULO 1 — IDENTIDADE BIOLÓGICA & TAXONOMIA ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 1', 'Identidade Biológica, Taxonomia e Ficha Técnica', 'Classificação científica e parâmetros essenciais do ' + a.nome + '.', a.nome, 3, totalPaginas);

            const t = ex.taxonomia;
            y = p.desenharCaixa({
                yTopo: y,
                titulo: 'CLASSIFICAÇÃO TAXONÔMICA COMPLETA',
                texto: 'Reino: ' + t.reino + '   |   Filo: ' + t.filo + '   |   Classe: ' + t.classe +
                    '\nOrdem: ' + t.ordem + '   |   Família: ' + t.familia +
                    '\nGênero: ' + t.genero + '   |   Nome científico: ' + a.nomeCientifico +
                    '\nNome internacional em inglês: ' + (t.nomeComumIngles || a.nome),
                barraEsquerda: [0.114, 0.435, 0.647],
                entrelinha: 15.5
            });

            y = p.desenharSecao(y, 'Habitat principal', a.ficha.habitat || a.ambiente);
            y = p.desenharSecao(y, 'Alimentação base', a.ficha.alimentacao || 'Não informado');
            y = p.desenharSecao(y, 'Porte e tamanho', a.ficha.tamanho || 'Não informado');
            y = p.desenharSecao(y, 'Expectativa de vida', a.ficha.expectativaVida || 'Não informado');
            p.desenharSecao(y, 'Resumo geral da biografia', a.biografia || ex.resumoExecutivo);
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 4: CAPÍTULO 2 — CRÔNICAS E HISTÓRIAS DE CAMPO ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 2', 'Crônicas, Lendas e Histórias de Campo', 'Relatos de expedições científicas, tradições costeiras/ribeirinhas e encontros marcantes.', a.nome, 4, totalPaginas);

            ex.historias.forEach((hist, idx) => {
                y = p.desenharCaixa({
                    yTopo: y,
                    titulo: 'HISTÓRIA ' + (idx + 1) + ' DE CAMPO E CULTURA',
                    texto: hist,
                    fundo: idx % 2 === 0 ? [0.94, 0.97, 0.99] : [0.95, 0.99, 0.98],
                    barraEsquerda: idx % 2 === 0 ? [0.114, 0.435, 0.647] : [0.125, 0.698, 0.667],
                    tamTexto: 10.2,
                    entrelinha: 14.5
                });
            });
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 5: CAPÍTULO 3 — LINHAS EVOLUTIVAS ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 3', 'Linhas Evolutivas e História Natural', 'Como milhões de anos de evolução moldaram a anatomia e fisiologia da espécie.', a.nome, 5, totalPaginas);

            y = p.desenharCaixa({
                yTopo: y,
                titulo: 'ORIGEM NO REGISTRO GEOLÓGICO',
                texto: ex.evolucao.origemGeologica,
                barraEsquerda: [0.114, 0.435, 0.647]
            });
            y = p.desenharSecao(y, 'Trajetória e transições evolutivas', ex.evolucao.historiaEvolutiva);
            y = p.desenharBlocoTexto({ x: MARGEM_ESQ, y: y - 2, tamanho: 12, entrelinha: 16, fonte: 'F2', texto: 'Principais adaptações evolutivas conquistadas', cor: [0.043, 0.224, 0.329] });
            p.desenharLista(y - 4, ex.evolucao.adaptacoesChave);
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 6: CAPÍTULO 4 — ESPÉCIES MAIS PRÓXIMAS ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 4', 'Espécies Mais Próximas e Parentesco Evolutivo', 'Comparação com espécies irmãs, parentes próximos e linhagens relacionadas.', a.nome, 6, totalPaginas);

            y = p.desenharSecao(y, 'Panorama comparativo da linhagem', ex.especiesProximas.introducao);
            (ex.especiesProximas.parentes || []).forEach((par, idx) => {
                y = p.desenharCaixa({
                    yTopo: y,
                    titulo: (idx + 1) + '. ' + par.nome + ' (' + par.nomeCientifico + ')',
                    texto: par.diferenca,
                    barraEsquerda: [0.125, 0.698, 0.667],
                    padY: 10
                });
            });
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 7: CAPÍTULO 5 — HABITAT E ECOSSISTEMA ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 5', 'Habitat, Distribuição Geográfica e Ecossistema', 'Onde vive, condições da água e interações ecológicas essenciais.', a.nome, 7, totalPaginas);

            y = p.desenharSecao(y, 'Distribuição geográfica no planeta e no Brasil', ex.habitatEcossistema.distribuicaoGeografica);
            y = p.desenharSecao(y, 'Condições ambientais e micro-habitat', ex.habitatEcossistema.condicoesAmbientais);
            y = p.desenharSecao(y, 'Interações e papel no ecossistema', ex.habitatEcossistema.interacoesEcologicas);
            p.desenharCaixa({
                yTopo: y - 4,
                titulo: 'SÍNTESE DO AMBIENTE (' + a.ambiente.toUpperCase() + ')',
                texto: 'Ficha ecológica resumida: ' + (a.ficha.habitat || a.ambiente) + '. Proteger este ambiente significa salvaguardar não apenas o ' + a.nome + ', mas toda a rede de espécies associadas.',
                barraEsquerda: [0.114, 0.435, 0.647]
            });
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 8: CAPÍTULO 6 — COMO VIVEM ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 6', 'Como Vivem: Comportamento, Rotina e Sentidos', 'Organização social, ciclos diários, deslocamentos e percepção sensorial.', a.nome, 8, totalPaginas);

            y = p.desenharSecao(y, 'Organização social e convivência', ex.comoVivem.comportamentoSocial);
            y = p.desenharSecao(y, 'Rotina diária, descanso e migrações', ex.comoVivem.rotinaEMigracao);
            y = p.desenharSecao(y, 'Comunicação e percepção sensorial', ex.comoVivem.comunicacaoESentidos);
            p.desenharCaixa({
                yTopo: y - 4,
                titulo: 'OBSERVAÇÃO COMPORTAMENTAL',
                texto: a.biografia,
                fundo: [0.95, 0.99, 0.98],
                barraEsquerda: [0.125, 0.698, 0.667]
            });
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 9: CAPÍTULO 7 — REPRODUÇÃO E CICLO DE VIDA ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 7', 'Ciclo de Vida e Estratégias de Reprodução', 'Da maturidade sexual e cortejo até o nascimento e desenvolvimento dos filhotes.', a.nome, 9, totalPaginas);

            y = p.desenharSecao(y, 'Maturidade sexual e ritual de cortejo', ex.reproducao.maturidadeECortejo);
            y = p.desenharSecao(y, 'Fecundação, gestação ou desova', ex.reproducao.gestacaoOuDesova);
            y = p.desenharSecao(y, 'Cuidado parental e primeiros passos dos filhotes', ex.reproducao.cuidadoParental);
            p.desenharCaixa({
                yTopo: y - 4,
                titulo: 'LONGEVIDADE E RENOVAÇÃO DA ESPÉCIE',
                texto: 'Expectativa de vida média: ' + (a.ficha.expectativaVida || 'variável') + '. A preservação de áreas calmas de reprodução e berçários naturais determina diretamente quantos jovens conseguirão atingir a fase adulta.',
                barraEsquerda: [0.114, 0.435, 0.647]
            });
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 10: CAPÍTULO 8 — COMO SE ALIMENTAM ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 8', 'Estratégias de Alimentação e Teia Trófica', 'O que consome em cada fase da vida e como captura seus alimentos.', a.nome, 10, totalPaginas);

            y = p.desenharSecao(y, 'Dieta nas diferentes fases de vida', ex.alimentacaoDetalhada.dietaPorFase);
            y = p.desenharSecao(y, 'Anatomia alimentar e técnicas de captura', ex.alimentacaoDetalhada.tecnicasDeCaptura);
            y = p.desenharSecao(y, 'Função na teia alimentar aquática', ex.alimentacaoDetalhada.papelTrofico);
            p.desenharCaixa({
                yTopo: y - 4,
                titulo: 'RESUMO NUTRICIONAL DA FICHA',
                texto: a.ficha.alimentacao || ex.alimentacaoDetalhada.dietaPorFase,
                barraEsquerda: [0.125, 0.698, 0.667]
            });
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 11: CAPÍTULO 9 — COMO SE PROTEGEM ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 9', 'Mecanismos de Defesa, Predadores e Sobrevivência', 'Estratégias físicas, químicas e comportamentais para escapar de perigos.', a.nome, 11, totalPaginas);

            y = p.desenharSecao(y, 'Armas naturais e defesas anatômicas', ex.defesa.mecanismosDeProtecao);
            y = p.desenharSecao(y, 'Principais predadores na natureza', ex.defesa.predadoresNaturais);
            y = p.desenharSecao(y, 'Táticas comportamentais de fuga e proteção', ex.defesa.estrategiasComportamentais);
            p.desenharCaixa({
                yTopo: y - 4,
                titulo: 'EQUILÍBRIO PREDADOR-PRESA',
                texto: 'As defesas evoluídas ao longo de milhões de anos protegem o ' + a.nome + ' contra inimigos naturais, mas nem sempre funcionam contra ameaças artificiais humanas como plásticos, redes invisíveis e poluição química.',
                barraEsquerda: [0.114, 0.435, 0.647]
            });
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 12: CAPÍTULO 10 — AMEAÇAS ATUAIS ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 10', 'Ameaças Atuais e Riscos à Sobrevivência', 'Por que a espécie encontra-se no nível ' + a.status + ' e quais fatores exigem ação urgente.', a.nome, 12, totalPaginas);

            y = p.desenharCaixa({
                yTopo: y,
                titulo: 'DIAGNÓSTICO DE RISCO (' + a.status + ')',
                texto: a.motivoAmeaca || ex.ameacasDetalhes.panoramaAtual,
                fundo: [0.99, 0.95, 0.95],
                borda: [0.94, 0.78, 0.78],
                barraEsquerda: [0.78, 0.16, 0.16],
                corTitulo: [0.65, 0.12, 0.12]
            });

            y = p.desenharSecao(y, 'Panorama científico atual', ex.ameacasDetalhes.panoramaAtual);
            y = p.desenharBlocoTexto({ x: MARGEM_ESQ, y: y - 2, tamanho: 12, entrelinha: 16, fonte: 'F2', texto: 'Principais fatores de pressão humana e ambiental', cor: [0.043, 0.224, 0.329] });
            p.desenharLista(y - 4, ex.ameacasDetalhes.fatoresCriticos);
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 13: CAPÍTULO 11 — POR QUE ADOTAR E CONSERVAÇÃO ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 11', 'Por Que Adotar e Como Sua Doação Age em Campo', 'O impacto direto da adoção simbólica em pesquisa, resgate e recuperação de habitats.', a.nome, 13, totalPaginas);

            y = p.desenharCaixa({
                yTopo: y,
                titulo: 'POR QUE ADOTAR ESTA ESPÉCIE?',
                texto: a.porqueAdotar || ex.conservacaoAcoes.comoADoacaoAjuda,
                fundo: [0.94, 0.99, 0.98],
                borda: [0.75, 0.93, 0.89],
                barraEsquerda: [0.125, 0.698, 0.667]
            });

            y = p.desenharSecao(y, 'Aplicação dos recursos na conservação', ex.conservacaoAcoes.comoADoacaoAjuda);
            y = p.desenharBlocoTexto({ x: MARGEM_ESQ, y: y - 2, tamanho: 12, entrelinha: 16, fonte: 'F2', texto: 'Frentes de trabalho apoiadas pelo projeto', cor: [0.043, 0.224, 0.329] });
            p.desenharLista(y - 4, ex.conservacaoAcoes.frentesDeTrabalho);
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 14: CAPÍTULO 12 — CURIOSIDADES CIENTÍFICAS ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 12', 'Curiosidades Científicas e Fatos Surpreendentes', 'Descobertas fascinantes sobre a biologia, genética e comportamento do ' + a.nome + '.', a.nome, 14, totalPaginas);

            ex.curiosidadesExtras.forEach((cur, idx) => {
                y = p.desenharCaixa({
                    yTopo: y,
                    titulo: 'FATO CIENTÍFICO #' + (idx + 1),
                    texto: cur,
                    barraEsquerda: idx % 2 === 0 ? [0.114, 0.435, 0.647] : [0.125, 0.698, 0.667],
                    padY: 10
                });
            });
            paginas.push(p.ops.join('\n'));
        }

        // === PÁGINA 15: CAPÍTULO 13 — BOAS PRÁTICAS E CERTIFICADO ===
        {
            const p = criarPaginaCanvas();
            let y = p.desenharCabecalhoCapitulo('Capítulo 13', 'Guia de Boas Práticas e Certificado de Adoção', 'Como continuar ajudando os oceanos e rios no dia a dia.', a.nome, 15, totalPaginas);

            y = p.desenharBlocoTexto({ x: MARGEM_ESQ, y: y, tamanho: 12, entrelinha: 16, fonte: 'F2', texto: 'Ações práticas ao alcance de todos', cor: [0.043, 0.224, 0.329] });
            y = p.desenharLista(y - 4, ex.conservacaoAcoes.boasPraticasApoiador);

            // Certificado oficial emoldurado na metade inferior
            const yCertTopo = Math.min(y - 16, 355);
            const altCert = 240;
            const yCertBase = yCertTopo - altCert;
            if (yCertBase >= 68) {
                p.corPreenchimento(0.95, 0.98, 1.0);
                p.corContorno(0.043, 0.224, 0.329);
                p.ops.push('2 w');
                p.retangulo(MARGEM_ESQ, yCertBase, LARGURA_UTIL, altCert, true, true);

                p.corContorno(0.125, 0.698, 0.667);
                p.ops.push('1 w');
                p.retangulo(MARGEM_ESQ + 7, yCertBase + 7, LARGURA_UTIL - 14, altCert - 14, false, true);

                p.corPreenchimento(0.043, 0.224, 0.329);
                p.retangulo(MARGEM_ESQ + 7, yCertTopo - 46, LARGURA_UTIL - 14, 39, true, false);
                p.textoSimples(MARGEM_ESQ + 22, yCertTopo - 31, 13, 'F2', 'CERTIFICADO SIMBÓLICO DE ADOÇÃO AQUÁTICA', 1, 1, 1);

                let yc = yCertTopo - 74;
                yc = p.desenharBlocoTexto({
                    x: MARGEM_ESQ + 22,
                    y: yc,
                    largura: LARGURA_UTIL - 44,
                    tamanho: 11,
                    entrelinha: 16,
                    fonte: 'F1',
                    texto: 'Certificamos que ' + d.apoiadorNome + ' (' + d.apoiadorEmail + ') realizou uma adoção simbólica no valor de ' + d.valorTexto + ', contribuindo para a conservação da espécie:',
                    cor: [0.16, 0.22, 0.30]
                });

                p.textoSimples(MARGEM_ESQ + 22, yc - 14, 17, 'F2', a.nome + ' (' + a.nomeCientifico + ')', 0.043, 0.224, 0.329);
                p.textoSimples(MARGEM_ESQ + 22, yc - 36, 10, 'F1', 'Ambiente protegido: ' + a.ambiente + '   ·   Status atual: ' + a.status, 0.125, 0.698, 0.667);
                p.textoSimples(MARGEM_ESQ + 22, yCertBase + 26, 9.5, 'F2', 'Emitido em ' + d.dataTexto + '   |   Código: ' + d.codigoCertificado + '   |   Adote um Peixe', 0.35, 0.43, 0.52);
            }

            paginas.push(p.ops.join('\n'));
        }

        return paginas;
    }

    function stringAsciiParaBytes(str) {
        const out = [];
        for (let i = 0; i < str.length; i++) {
            out.push(str.charCodeAt(i) & 0xFF);
        }
        return out;
    }

    function gerarPdfEbookBytes(animalBruto, ebookExtra, doacaoInfo) {
        const conteudosPaginas = construirPaginasEbook(animalBruto, ebookExtra, doacaoInfo);
        const numPaginas = conteudosPaginas.length;

        // Objetos PDF:
        // 1: Catalog
        // 2: Pages
        // 3: Font F1 (Helvetica)
        // 4: Font F2 (Helvetica-Bold)
        // 5: Font F3 (Helvetica-Oblique)
        // 6..6+N-1: Page objects
        // 6+N..6+2N-1: Content stream objects
        const primeiroObjPagina = 6;
        const primeiroObjConteudo = primeiroObjPagina + numPaginas;
        const totalObjetos = primeiroObjConteudo + numPaginas - 1;

        const kidsRefs = [];
        for (let i = 0; i < numPaginas; i++) {
            kidsRefs.push((primeiroObjPagina + i) + ' 0 R');
        }

        const objetos = {};
        objetos[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        objetos[2] = '<< /Type /Pages /Count ' + numPaginas + ' /Kids [ ' + kidsRefs.join(' ') + ' ] >>';
        objetos[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
        objetos[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
        objetos[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>';

        for (let i = 0; i < numPaginas; i++) {
            const idPagina = primeiroObjPagina + i;
            const idConteudo = primeiroObjConteudo + i;
            const streamTexto = conteudosPaginas[i];
            objetos[idPagina] =
                '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + LARGURA_A4 + ' ' + ALTURA_A4 + '] ' +
                '/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ' + idConteudo + ' 0 R >>';
            objetos[idConteudo] =
                '<< /Length ' + streamTexto.length + ' >>\nstream\n' + streamTexto + '\nendstream';
        }

        const buffer = [];
        function empurrar(str) {
            const b = stringAsciiParaBytes(str);
            for (let i = 0; i < b.length; i++) buffer.push(b[i]);
        }

        empurrar('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

        const offsets = [0];
        for (let id = 1; id <= totalObjetos; id++) {
            offsets[id] = buffer.length;
            empurrar(id + ' 0 obj\n' + objetos[id] + '\nendobj\n');
        }

        const inicioXref = buffer.length;
        empurrar('xref\n0 ' + (totalObjetos + 1) + '\n');
        empurrar('0000000000 65535 f \n');
        for (let id = 1; id <= totalObjetos; id++) {
            const off = String(offsets[id]).padStart(10, '0');
            empurrar(off + ' 00000 n \n');
        }

        empurrar(
            'trailer\n<< /Size ' + (totalObjetos + 1) + ' /Root 1 0 R >>\n' +
            'startxref\n' + inicioXref + '\n%%EOF\n'
        );

        return new Uint8Array(buffer);
    }

    function baixarEbookPdf(animalBruto, ebookExtra, doacaoInfo) {
        const bytes = gerarPdfEbookBytes(animalBruto, ebookExtra, doacaoInfo);
        const nomeSlug = String((animalBruto && animalBruto.id) || 'especie').replace(/[^a-z0-9_-]/gi, '-');
        const nomeArquivo = 'ebook-' + nomeSlug + '.pdf';

        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);

        return { nomeArquivo: nomeArquivo, tamanhoBytes: bytes.length, paginas: 15 };
    }

    globalScope.EbookAdoteUmPeixe = {
        montarDadosCompletos: montarDadosCompletos,
        construirPaginasEbook: construirPaginasEbook,
        gerarPdfEbookBytes: gerarPdfEbookBytes,
        baixarEbookPdf: baixarEbookPdf
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = globalScope.EbookAdoteUmPeixe;
    }
})(typeof window !== 'undefined' ? window : globalThis);
