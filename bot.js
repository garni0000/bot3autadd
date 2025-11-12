const http = require('http');
const { Telegraf, Markup } = require('telegraf');
const { MongoClient } = require('mongodb');
const axios = require('axios');
require('dotenv').config();

// MongoDB connection from .env
const mongoUri = process.env.MONGODB_URI;
const client = new MongoClient(mongoUri);
let db;

// Telegram Bot Token from .env
const BOT_TOKEN = process.env.BOT_TOKEN;

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db(process.env.MONGODB_DB_NAME || 'telegram_bot');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

// Store user data
async function storeUser(user) {
    try {
        const users = db.collection('users');
        await users.updateOne(
            { id: user.id },
            { $set: user },
            { upsert: true }
        );
    } catch (err) {
        console.error('Error storing user:', err);
    }
}

// Get all users
async function getAllUsers() {
    try {
        const users = db.collection('users');
        return await users.find().toArray();
    } catch (err) {
        console.error('Error getting users:', err);
        return [];
    }
}

// Send welcome DM
async function sendWelcomeDM(userId, firstName, channelUsername) {
    try {
        const videoUrl = process.env.WELCOME_VIDEO_URL || 'https://t.me/xfortune00/7';
        const welcomeMessage = process.env.WELCOME_MESSAGE || `${firstName} vous êtes sur le point de rejoindre l'élite pour gagner avec sur le jeu Apple off Fortune. Veillez vite joindre le canal pour profiter des hack.`;
        const caption = welcomeMessage.replace('%firstName%', firstName);

        const keyboard = Markup.inlineKeyboard([
            Markup.button.url('Rejoindre maintenant ✅', process.env.JOIN_CHANNEL_URL || 'https://t.me/+QikOESUgWG1hYThk')
        ]);

        await bot.telegram.sendVideo(userId, videoUrl, {
            caption: caption,
            ...keyboard
        });

        console.log(`Welcome DM sent to ${userId} for channel ${channelUsername}`);
    } catch (err) {
        console.error('Error sending welcome DM:', err);
    }
}

// Add user to channel after specified minutes
async function addUserToChannel(userId, channelId) {
    try {
        const waitMinutes = parseInt(process.env.WAIT_MINUTES) || 10;
        
        // Wait specified minutes
        await new Promise(resolve => setTimeout(resolve, waitMinutes * 60 * 1000));

        // Add user to channel
        await bot.telegram.approveChatJoinRequest(channelId, userId);
        console.log(`User ${userId} added to channel ${channelId}`);

        // Update user status in DB
        const users = db.collection('users');
        await users.updateOne(
            { id: userId },
            { $set: { joined: true, joinDate: new Date() } }
        );
    } catch (err) {
        console.error('Error adding user to channel:', err);
    }
}

// Generate random ad
function getRandomAd(firstName = "TestUser") {
    const botUsername = process.env.BOT_USERNAME || 'xgamabot_bot';
    const promoCode = process.env.PROMO_CODE || 'Free221';
    const registerUrl = process.env.REGISTER_URL || 'https://cut.solkah.org/1xbet';

    const ads = [
        {
            video: process.env.AD_VIDEO_1 || 'https://t.me/xfortune00/6',
            caption: `${firstName}, découvrez comment créer un compte authentique pour débloquer le hack exclusif Apple Fortune! Utilisez le code promo ${promoCode} pour commencer gratuitement.`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Créer mon compte', registerUrl)
            ])
        },
        {
            caption: `🎉 Témoignage: Jean K. a gagné 500€ en 2 jours avec notre hack Apple Fortune! ${firstName}, à vous de jouer!`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Voir la preuve', process.env.PROOF_URL_1 || 'https://t.me/xfortune00/7'),
                Markup.button.url('Jouer maintenant', registerUrl)
            ])
        },
        {
            caption: `🔥 ${firstName}, le secret est révélé! Nos membres gagnent en moyenne 200€/jour avec Apple Fortune. Prenez votre part en créant un compte authentique avec le code ${promoCode}!`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Démarrer maintenant', registerUrl)
            ])
        },
        {
            video: process.env.AD_VIDEO_2 || 'https://t.me/xfortune00/8',
            caption: `Regardez comment Marc a gagné 750€ en 3 jours! ${firstName}, votre tour commence ici.`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Je veux gagner aussi', registerUrl)
            ])
        },
        {
            caption: `🚨 ALERTE ${firstName}! Offre spéciale pour les nouveaux membres: 100€ avec le code ${promoCode}. Valable 24h seulement!`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Profiter de l\'offre', registerUrl)
            ])
        },
        {
            caption: `💎 ${firstName}, découvrez la méthode secrète qui a rapporté 1200€ à Sarah en une semaine!`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Découvrir la méthode', registerUrl)
            ])
        },
        {
            caption: `📈 ${firstName}, nos statistiques montrent +300% de gains avec la nouvelle mise à jour!`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Tester maintenant', registerUrl)
            ])
        },
        {
            caption: `🎯 ${firstName}, technique exclusive révélée: comment multiplier vos gains par 5!`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Voir la technique', registerUrl)
            ])
        }
    ];

    return ads[Math.floor(Math.random() * ads.length)];
}

// Témoignage du jour
function getDailyTestimony() {
    const botUsername = process.env.BOT_USERNAME || 'xgamabot_bot';
    const registerUrl = process.env.REGISTER_URL || 'https://cut.solkah.org/1xbet';

    const testimonies = [
        {
            caption: `🌟 **TÉMOIGNAGE DU JOUR** 🌟\n\n"Grâce à @${botUsername}, j'ai gagné 850€ en 4 jours seulement! La méthode est simple et efficace. Je recommande à 100%!"\n- Kevin M., membre depuis 2 semaines\n\n🚀 Rejoignez l'aventure avec @${botUsername} !`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Voir la preuve', process.env.PROOF_URL_2 || 'https://t.me/xfortune00/10'),
                Markup.button.url('Commencer maintenant', registerUrl)
            ])
        },
        {
            caption: `💫 **TÉMOIGNAGE EXCLUSIF** 💫\n\n"Incroyable! 1200€ en une semaine avec les astuces de @${botUsername}. Je n'aurais jamais cru que c'était possible!"\n- Marie L., utilisatrice satisfaite\n\n📲 Ne ratez pas cette opportunité avec @${botUsername} !`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Témoignage vidéo', process.env.PROOF_URL_3 || 'https://t.me/xfortune00/11'),
                Markup.button.url('Essayer gratuitement', registerUrl)
            ])
        },
        {
            caption: `🎯 **TÉMOIGNAGE VÉRIFIÉ** 🎯\n\n"@${botUsername} a changé ma façon de jouer! Gains garantis et accompagnement personnalisé. Merci l'équipe!"\n- Alex D., gagnant régulier\n\n✨ Faites comme Alex avec @${botUsername} !`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Rejoindre le bot', `https://t.me/${botUsername}`),
                Markup.button.url('Démarrer', registerUrl)
            ])
        }
    ];

    return testimonies[Math.floor(Math.random() * testimonies.length)];
}

// Message de promotion du bot
function getBotPromotion() {
    const botUsername = process.env.BOT_USERNAME || 'xgamabot_bot';
    const promoCode = process.env.PROMO_CODE || 'FREE221';
    const registerUrl = process.env.REGISTER_URL || 'https://cut.solkah.org/1xbet';
    
    return {
        caption: `🤖 **DÉCOUVREZ @${botUsername}** 🤖\n\nNotre bot exclusif vous offre :\n✅ Des hacks Apple Fortune en temps réel\n✅ Des alertes gains instantanées\n✅ Un accompagnement personnalisé\n✅ Des codes promo exclusifs\n✅ Des témoignages vérifiés\n\n🎁 **OFFRE SPÉCIALE** : Utilisez le code "${promoCode}" pour un bonus de bienvenue !`,
        keyboard: Markup.inlineKeyboard([
            [Markup.button.url('👑 Rejoindre @' + botUsername, `https://t.me/${botUsername}`)],
            [Markup.button.url('🎯 Commencer à gagner', registerUrl)]
        ])
    };
}

// Send targeted ads
async function sendTargetedAds() {
    try {
        const users = await getAllUsers();
        const now = new Date();
        const adIntervalHours = parseInt(process.env.AD_INTERVAL_HOURS) || 6;

        for (const user of users) {
            // Skip if user hasn't joined yet or joined less than 24 hours ago
            if (!user.joined || (now - new Date(user.joinDate)) < 24 * 60 * 60 * 1000) {
                continue;
            }

            // Skip if last ad was sent less than specified hours ago
            if (user.lastAd && (now - new Date(user.lastAd)) < adIntervalHours * 60 * 60 * 1000) {
                continue;
            }

            // Select a random ad
            const ad = getRandomAd(user.first_name);

            try {
                if (ad.video) {
                    await bot.telegram.sendVideo(user.id, ad.video, {
                        caption: ad.caption,
                        ...ad.keyboard,
                        parse_mode: 'Markdown'
                    });
                } else {
                    await bot.telegram.sendMessage(user.id, ad.caption, {
                        ...ad.keyboard,
                        parse_mode: 'Markdown'
                    });
                }

                // Update lastAd timestamp
                const users = db.collection('users');
                await users.updateOne(
                    { id: user.id },
                    { $set: { lastAd: new Date() } }
                );

                console.log(`Ad sent to ${user.id}`);
            } catch (err) {
                console.error(`Error sending ad to ${user.id}:`, err);
            }
        }
    } catch (err) {
        console.error('Error in sendTargetedAds:', err);
    }
}

// Send daily testimony to all users
async function sendDailyTestimony() {
    try {
        const users = await getAllUsers();
        const testimony = getDailyTestimony();

        for (const user of users) {
            // Only send to users who joined more than 24 hours ago
            if (!user.joined || (new Date() - new Date(user.joinDate)) < 24 * 60 * 60 * 1000) {
                continue;
            }

            try {
                await bot.telegram.sendMessage(user.id, testimony.caption, {
                    ...testimony.keyboard,
                    parse_mode: 'Markdown'
                });

                console.log(`Daily testimony sent to ${user.id}`);
            } catch (err) {
                console.error(`Error sending testimony to ${user.id}:`, err);
            }
        }
    } catch (err) {
        console.error('Error in sendDailyTestimony:', err);
    }
}

// Send bot promotion
async function sendBotPromotion() {
    try {
        const users = await getAllUsers();
        const promotion = getBotPromotion();
        const promotionIntervalDays = parseInt(process.env.PROMOTION_INTERVAL_DAYS) || 3;

        for (const user of users) {
            // Send to all users who joined more than 48 hours ago
            if (!user.joined || (new Date() - new Date(user.joinDate)) < 48 * 60 * 60 * 1000) {
                continue;
            }

            // Skip if promotion was sent less than specified days ago
            if (user.lastPromotion && (new Date() - new Date(user.lastPromotion)) < promotionIntervalDays * 24 * 60 * 60 * 1000) {
                continue;
            }

            try {
                await bot.telegram.sendMessage(user.id, promotion.caption, {
                    ...promotion.keyboard,
                    parse_mode: 'Markdown'
                });

                // Update lastPromotion timestamp
                const users = db.collection('users');
                await users.updateOne(
                    { id: user.id },
                    { $set: { lastPromotion: new Date() } }
                );

                console.log(`Bot promotion sent to ${user.id}`);
            } catch (err) {
                console.error(`Error sending promotion to ${user.id}:`, err);
            }
        }
    } catch (err) {
        console.error('Error in sendBotPromotion:', err);
    }
}

// Handle channel join requests from any channel
bot.on('chat_join_request', async (ctx) => {
    const chat = ctx.update.chat_join_request.chat;
    const user = {
        id: ctx.from.id,
        first_name: ctx.from.first_name,
        username: ctx.from.username,
        requestedAt: new Date()
    };

    // Store user
    await storeUser(user);

    // Get channel username for the welcome message
    let channelUsername = chat.username || `channel_${chat.id}`;

    // Send welcome DM after 3 seconds
    setTimeout(() => {
        sendWelcomeDM(user.id, user.first_name, channelUsername);
    }, 3000);

    // Schedule adding to channel after specified minutes
    setTimeout(() => {
        addUserToChannel(user.id, chat.id);
    }, (parseInt(process.env.WAIT_MINUTES) || 10) * 60 * 1000);

    console.log(`New join request from ${user.id} for channel ${chat.title} (${chat.id})`);
});

// Commande /test pour voir un exemple d'ads
bot.command('test', async (ctx) => {
    try {
        // Générer une publicité aléatoire
        const ad = getRandomAd(ctx.from.first_name);

        // Envoyer l'exemple
        if (ad.video) {
            await ctx.replyWithVideo(ad.video, {
                caption: ad.caption,
                ...ad.keyboard,
                parse_mode: 'Markdown'
            });
        } else {
            await ctx.reply(ad.caption, {
                ...ad.keyboard,
                parse_mode: 'Markdown'
            });
        }

        await ctx.reply("Ceci est un exemple aléatoire des publicités qui seront envoyées aux utilisateurs.");
    } catch (err) {
        console.error('Error in /test command:', err);
        await ctx.reply("Une erreur s'est produite lors de la génération de l'exemple.");
    }
});

// Commande /temoignage pour voir le témoignage du jour
bot.command('temoignage', async (ctx) => {
    try {
        const testimony = getDailyTestimony();
        await ctx.reply(testimony.caption, {
            ...testimony.keyboard,
            parse_mode: 'Markdown'
        });
    } catch (err) {
        console.error('Error in /temoignage command:', err);
    }
});

// Commande /promo pour voir la promotion du bot
bot.command('promo', async (ctx) => {
    try {
        const promotion = getBotPromotion();
        await ctx.reply(promotion.caption, {
            ...promotion.keyboard,
            parse_mode: 'Markdown'
        });
    } catch (err) {
        console.error('Error in /promo command:', err);
    }
});

// Commande /stats pour voir les statistiques
bot.command('stats', async (ctx) => {
    try {
        const users = await getAllUsers();
        const joinedUsers = users.filter(u => u.joined).length;

        await ctx.reply(
            `📊 **Statistiques du Bot**\n\n` +
            `👥 Utilisateurs totaux: ${users.length}\n` +
            `✅ Utilisateurs ayant rejoint: ${joinedUsers}\n` +
            `🕒 Dernière mise à jour: ${new Date().toLocaleString()}\n\n` +
            `🤖 Le bot fonctionne sur tous les canaux où il est administrateur !`
        );
    } catch (err) {
        console.error('Error in /stats command:', err);
    }
});

// Start scheduled tasks
function startScheduledTasks() {
    const adIntervalHours = parseInt(process.env.AD_INTERVAL_HOURS) || 6;
    const promotionIntervalDays = parseInt(process.env.PROMOTION_INTERVAL_DAYS) || 3;
    const testimonyHour = parseInt(process.env.TESTIMONY_HOUR) || 12;

    // Send targeted ads every specified hours
    setInterval(sendTargetedAds, adIntervalHours * 60 * 60 * 1000);

    // Send daily testimony at specified time
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === testimonyHour && now.getMinutes() === 0) {
            sendDailyTestimony();
        }
    }, 60 * 1000);

    // Send bot promotion every specified days
    setInterval(sendBotPromotion, promotionIntervalDays * 24 * 60 * 60 * 1000);

    // Initial runs
    sendTargetedAds();
    setTimeout(sendDailyTestimony, 5000);
    setTimeout(sendBotPromotion, 10000);
}

// Start bot
(async () => {
    await connectDB();
    startScheduledTasks();

    bot.launch().then(() => {
        console.log('✅ Bot is running - Il fonctionnera sur tous les canaux où il est admis');
    });
})();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Serveur HTTP de statut (port from .env)
const PORT = process.env.PORT || 8080;
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot en ligne - Fonctionne automatiquement sur tous les canaux admis');
  })
  .listen(PORT, () => console.log(`🌐 Serveur HTTP actif sur le port ${PORT}`));
