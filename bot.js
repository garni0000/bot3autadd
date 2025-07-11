
const { Telegraf, Markup } = require('telegraf');
const { MongoClient } = require('mongodb');
const axios = require('axios');

// MongoDB connection
const mongoUri = 'mongodb+srv://papisceegg:9DK3LUn7p2P9V2SN@cluster0.8jb3cir.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(mongoUri);
let db;

// Telegram Bot Token
const BOT_TOKEN = '7796965802:AAGDsFwqhVVkATAfUROvTMymVsplJsAlxkc';
const CHANNEL_USERNAME = '@solkah00'; // Your channel username
const TARGET_CHANNEL_ID = -1002865214197; // Replace with your channel ID

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db('telegram_bot');
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
async function sendWelcomeDM(userId, firstName) {
    try {
        const videoUrl = 'https://t.me/xfortune00/5';
        const caption = `${firstName} vous êtes sur le point de rejoindre l'élite pour gagner avec sur le jeu Apple off Fortune. Veillez vite joindre le canal pour profiter des hack.`;

        const keyboard = Markup.inlineKeyboard([
            Markup.button.url('Rejoindre maintenant ✅', `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`)
        ]);

        await bot.telegram.sendVideo(userId, videoUrl, {
            caption: caption,
            ...keyboard
        });

        console.log(`Welcome DM sent to ${userId}`);
    } catch (err) {
        console.error('Error sending welcome DM:', err);
    }
}

// Add user to channel after 10 minutes
async function addUserToChannel(userId) {
    try {
        // Wait 10 minutes
        await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));

        // Add user to channel
        await bot.telegram.approveChatJoinRequest(TARGET_CHANNEL_ID, userId);
        console.log(`User ${userId} added to channel`);

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
    const ads = [
        {
            video: 'https://t.me/xfortune00/6',
            caption: `${firstName}, découvrez comment créer un compte authentique pour débloquer le hack exclusif Apple Fortune! Utilisez le code promo Free221 pour commencer gratuitement.`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Créer mon compte', 'https://bit.ly/3NJ4vy0')
            ])
        },
        {
            caption: `🎉 Témoignage: Jean K. a gagné 500€ en 2 jours avec notre hack Apple Fortune! ${firstName}, à vous de jouer!`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Voir la preuve', 'https://t.me/xfortune00/7'),
                Markup.button.url('jouer  maintenant', 'https://bit.ly/3NJ4vy0')
            ])
        },
        {
            caption: `🔥 ${firstName}, le secret est révélé! Nos membres gagnent en moyenne 200€/jour avec Apple Fortune.Prend t'as part en creant un compte authentiqueavec le code Free221!`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Démarrer maintenant', 'https://bit.ly/3NJ4vy0')
            ])
        },
        {
            video: 'https://t.me/xfortune00/8',
            caption: `Regardez comment Marc a gagné 750€ en 3 jours! ${firstName}, votre tour commence ici.`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Je veux gagner aussi', 'https://bit.ly/3NJ4vy0')
            ])
        },
        {
            caption: `🚨 ALERTE ${firstName}! Offre spéciale pour les nouveaux membres: 0€ avec le code Free221. Valable 24h seulement!`,
            keyboard: Markup.inlineKeyboard([
                Markup.button.url('Profiter de l\'offre', 'https://bit.ly/3NJ4vy0')
            ])
        },
        // Ajoutez 25 autres variations ici pour atteindre 30 modèles
    ];

    return ads[Math.floor(Math.random() * ads.length)];
}

// Send targeted ads
async function sendTargetedAds() {
    try {
        const users = await getAllUsers();
        const now = new Date();

        for (const user of users) {
            // Skip if user hasn't joined yet or joined less than 24 hours ago
            if (!user.joined || (now - new Date(user.joinDate)) < 24 * 60 * 60 * 1000) {
                continue;
            }

            // Skip if last ad was sent less than 6 hours ago
            if (user.lastAd && (now - new Date(user.lastAd)) < 6 * 60 * 60 * 1000) {
                continue;
            }

            // Select a random ad
            const ad = getRandomAd(user.first_name);

            try {
                if (ad.video) {
                    await bot.telegram.sendVideo(user.id, ad.video, {
                        caption: ad.caption,
                        ...ad.keyboard
                    });
                } else {
                    await bot.telegram.sendMessage(user.id, ad.caption, {
                        ...ad.keyboard
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

// Handle channel join requests
bot.on('chat_join_request', async (ctx) => {
    const user = {
        id: ctx.from.id,
        first_name: ctx.from.first_name,
        username: ctx.from.username,
        requestedAt: new Date()
    };

    // Store user
    await storeUser(user);

    // Send welcome DM after 3 seconds
    setTimeout(() => {
        sendWelcomeDM(user.id, user.first_name);
    }, 3000);

    // Schedule adding to channel after 10 minutes
    setTimeout(() => {
        addUserToChannel(user.id);
    }, 10 * 60 * 1000);
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
                ...ad.keyboard
            });
        } else {
            await ctx.reply(ad.caption, {
                ...ad.keyboard
            });
        }

        await ctx.reply("Ceci est un exemple aléatoire des publicités qui seront envoyées aux utilisateurs.");
    } catch (err) {
        console.error('Error in /test command:', err);
        await ctx.reply("Une erreur s'est produite lors de la génération de l'exemple.");
    }
});

// Start scheduled tasks
function startScheduledTasks() {
    // Send targeted ads every 6 hours
    setInterval(sendTargetedAds, 6 * 60 * 60 * 1000);

    // Initial run
    sendTargetedAds();
}

// Start bot
(async () => {
    await connectDB();
    startScheduledTasks();

    bot.launch().then(() => {
        console.log('Bot is running');
    });
})();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
