// fixAllThumbnails.js
const mongoose = require('mongoose');
const Product = require('./src/models/product.model'); // *** Ajuste o caminho se seu modelo estiver em outro lugar ***
require('dotenv').config(); // Carrega suas variáveis de ambiente (como MONGODB_URI)

async function fixAllProductThumbnails() {
    let fixedCount = 0;
    let skippedCount = 0;

    try {
        // **PASSO 1: CONEXÃO AO DB**
        // Use sua string de conexão completa do Atlas aqui.
        // Ela geralmente está no seu arquivo .env como MONGODB_URI.
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Conectado ao MongoDB Atlas para correção em massa...');

        // **PASSO 2: ENCONTRAR E CORRIGIR PRODUTOS**
        // Encontra todos os produtos que têm o campo 'thumbnails' como uma string.
        // A regex busca strings que começam e terminam com colchetes e aspas.
        const productsToFix = await Product.find({
            thumbnails: { $type: "string", $regex: /^"\[".*"\]"$/ } // Busca a string literal problemática
        });

        console.log(`🔍 Encontrados ${productsToFix.length} produtos para verificar/corrigir.`);

        for (const product of productsToFix) {
            try {
                let thumbnailString = product.thumbnails;

                // Verifica se já é um array, para não processar duas vezes (embora o filtro já ajude)
                if (Array.isArray(thumbnailString)) {
                    console.log(`Produto ${product._id} já é um array. Pulando.`);
                    skippedCount++;
                    continue;
                }

                // Tenta remover o formato problemático: "[\"imagem.jpg\"]" -> imagem.jpg
                // Verifica se a string tem o padrão esperado para evitar erros
                if (thumbnailString.startsWith('"[') && thumbnailString.endsWith(']"')) {
                    // Remove a aspa inicial, os colchetes e as aspas internas/externas
                    let cleanName = thumbnailString.substring(2, thumbnailString.length - 2); // Remove "[ e ]"
                    // Agora, remove as aspas duplas internas que podem ter sobrado, ex: \"imagem.jpg\"
                    cleanName = cleanName.replace(/\\"/g, ''); // Remove \"

                    if (cleanName) {
                        await Product.updateOne(
                            { _id: product._id },
                            { $set: { thumbnails: [cleanName] } } // Define como ARRAY com nome limpo
                        );
                        console.log(`✨ Produto ${product._id} corrigido: <span class="math-inline">\{thumbnailString\} \-\> \[</span>{cleanName}]`);
                        fixedCount++;
                    } else {
                        // Se a limpeza resultar em string vazia, defina para default.jpg ou ignore
                        console.log(`⚠️ Produto ${product._id} tinha string vazia ou inválida. Definindo para [default.jpg].`);
                        await Product.updateOne(
                            { _id: product._id },
                            { $set: { thumbnails: ["default.jpg"] } }
                        );
                        fixedCount++;
                    }
                } else {
                    console.log(`⚠️ Produto ${product._id} não corresponde ao padrão esperado. Pulando: ${thumbnailString}`);
                    skippedCount++;
                }

            } catch (updateError) {
                console.error(`❌ Erro ao processar produto ${product._id}:`, updateError);
                skippedCount++;
            }
        }

        console.log(`\n--- Sumário da Correção ---`);
        console.log(`Total de produtos verificados: ${productsToFix.length}`);
        console.log(`Produtos corrigidos com sucesso: ${fixedCount}`);
        console.log(`Produtos pulados/com erro: ${skippedCount}`);

    } catch (error) {
        console.error('🔥 ERRO GRAVE NO SCRIPT:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB.');
    }
}

fixAllProductThumbnails();