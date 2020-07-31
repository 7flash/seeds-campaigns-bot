require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api')
const buildTransaction = require('./buildTransaction')
const buildQrCode = require('./buildQrCode')

const token = process.env.BOT_TOKEN
const language = process.env.LANGUAGE

let Strings
if (language == 'en') {
    Strings = {
        confirm: 'Confirm',
        cancel: 'Cancel',
        again: 'Create again',
        creatorMessage: `Creator account name?`,
        recipientMessage: `Recipient account name?`,
        quantityMessage: `Seeds quantity?`,
        titleMessage: `Campaign title?`,
        descriptionMessage: `Campaign description?`,
        imageMessage: `Image link?`,
        urlMessage: `Web url link?`,
        fundMessage: `Funding account?`,
        confirmMessage: `Campaign is ready, confirm all right?`,
        showQrMessage: `Campaign is ready, please scan QR code with wallet and submit transaction`,
        doneCallback: 'Done!'
    }
} else {
    Strings = {
        confirm: 'Подтвердить',
        cancel: 'Отменить',
        again: 'Создать еще',
        creatorMessage: `Добро пожаловать! Я помогу тебе создать кампанию в SEEDS. Для начала напиши мне имя твоего SEEDS аккаунта?`,
        recipientMessage: `Напиши мне имя аккаунта который получит SEEDS в случае успеха?`,
        quantityMessage: `Сколько SEEDS запрашивается?`,
        titleMessage: `Заголовок кампании?`,
        descriptionMessage: `Описание кампании?`,
        imageMessage: `Отправь мне картинку для кампании?`,
        urlMessage: `Напиши ссылку на сайт или социальную сеть?`,
        fundMessage: `Желаемый источник финансирования?`,
        confirmMessage: `Предложение готово к отправке, все верно?`,
        showQrMessage: `Предложение готово к отправке, отсканируйте QR код через приложение кошелька`,
        doneCallback: 'Сделано!'
    }
}

const bot = new TelegramBot(token, { polling: true })

const conversations = {}

const Steps = {
    initial: 'Initial',
    creator: 'Creator',
    recipient: 'Recipient',
    quantity: 'Quantity',
    title: 'Title',
    summary: 'Summary',
    description: 'Description',
    image: 'Image',
    url: 'Url',
    fund: 'Fund',
    confirm: 'Confirm',
    showQr: 'ShowQr'
}

const buildButton = (text, callback_data) => ({
    text,
    callback_data
})

const Callbacks = {
    confirm: Strings.confirm,
    cancel: Strings.cancel
}

const Buttons = {
    confirm: buildButton(Strings.confirm, Callbacks.confirm),
    cancel: buildButton(Strings.cancel, Callbacks.cancel),
    again: buildButton(Strings.again, Callbacks.cancel)
}

const Messages = {
    creator: () => `💖 ${Strings.creatorMessage}`,
    recipient: () => `💖 ${Strings.recipientMessage}`,
    quantity: () => `💖 ${Strings.quantityMessage}`,
    title: () => `💖 ${Strings.titleMessage}`,
    description: () => `💖 ${Strings.descriptionMessage}`,
    image: () => `💖 ${Strings.imageMessage}`,
    url: () => `💖 ${Strings.urlMessage}`,
    fund: () => `💖 ${Strings.fundMessage}`,
    confirm: () => `💖 ${Strings.confirmMessage}`,
    showQr: () => `💖 ${Strings.showQrMessage}`
}

const buildConversation = (conversation = {}) => ({
    step: conversation.step || Steps.initial,
    creator: conversation.creator || null,
    recipient: conversation.recipient || null,
    quantity: conversation.quantity || null,
    title: conversation.title || null,
    summary: conversation.summary || null,
    description: conversation.description || null,
    image: conversation.image || null,
    url: conversation.url || null,
    fund: conversation.fund || null,
    removableMessageId: conversation.removableMessageId || null
})

const isStep = (chatId, step) => conversations[chatId] != null && conversations[chatId].step == step

const cleanRemovableMessage = (chatId) => {
    if (conversations[chatId] && conversations[chatId].removableMessageId)
        return bot.deleteMessage(chatId, conversations[chatId].removableMessageId)
    else return Promise.resolve()
}

const buildKeyboard = (buttons) => buttons ? ({
    reply_markup: {
        inline_keyboard: [buttons]
    }
}) : undefined

const sendMessage = async ({ chatId, text, buttons, conversation }) => {
    const message = await bot.sendMessage(chatId, text, buildKeyboard(buttons))

    await cleanRemovableMessage(chatId)

    conversations[chatId] = buildConversation({
        ...conversations[chatId],
        ...conversation,
        removableMessageId: message.message_id
    })
}

async function main() {
    bot.on('message', async message => {
        const chatId = message.chat.id
        const answer = message.text

        // conversations[chatId] = {
        //     step: Steps.fund,
        //     creator: 'sevenflash42',
        //     recipient: 'sevenflash42',
        //     quantity: '1.0000 SEEDS',
        //     title: 'title',
        //     summary: 'summary',
        //     description: 'description',
        //     image: 'image',
        //     url: 'url',
        //     fund: 'fund'
        // }

        if (conversations[chatId] == null)
            conversations[chatId] = buildConversation()

        switch (conversations[chatId].step) {
            case Steps.initial:
                await sendMessage({
                    chatId,
                    text: Messages.creator(),
                    conversation: {
                        step: Steps.creator
                    },
                    buttons: [Buttons.cancel]
                })
            case Steps.creator:
                await sendMessage({
                    chatId,
                    text: Messages.recipient(),
                    conversation: {
                        step: Steps.recipient,
                        creator: answer
                    },
                    buttons: [Buttons.cancel]
                })
                break;
            case Steps.recipient:
                await sendMessage({
                    chatId,
                    text: Messages.quantity(),
                    conversation: {
                        step: Steps.quantity,
                        recipient: answer
                    },
                    buttons: [Buttons.cancel]
                })
                break;
            case Steps.quantity:
                await sendMessage({
                    chatId,
                    text: Messages.title(),
                    conversation: {
                        step: Steps.title,
                        quantity: answer,
                    },
                    buttons: [Buttons.cancel]
                })
                break;
            case Steps.title:
                await sendMessage({
                    chatId,
                    text: Messages.description(),
                    conversation: {
                        step: Steps.description,
                        title: answer
                    },
                    buttons: [Buttons.cancel]
                })
                break;
            case Steps.description:
                await sendMessage({
                    chatId,
                    text: Messages.image(),
                    conversation: {
                        step: Steps.image,
                        description: answer
                    },
                    buttons: [Buttons.cancel]
                })
                break;
            case Steps.image:
                await sendMessage({
                    chatId,
                    text: Messages.url(),
                    conversation: {
                        step: Steps.url,
                        image: answer
                    },
                    buttons: [Buttons.cancel]
                })
                break;
            case Steps.url:
                await sendMessage({
                    chatId,
                    text: Messages.fund(),
                    conversation: {
                        step: Steps.fund,
                        url: answer
                    },
                    buttons: [Buttons.cancel]
                })
                break;
            case Steps.fund:
                await sendMessage({
                    chatId,
                    text: Messages.confirm(),
                    conversation: {
                        step: Steps.confirm,
                        fund: answer
                    },
                    buttons: [Buttons.cancel]
                })
                await sendMessage({
                    chatId,
                    text: JSON.stringify(conversations[chatId]),
                    buttons: [Buttons.confirm, Buttons.cancel],
                })
                break;
            case Steps.done:
                break;
        }
    })

    bot.on('photo', async message => {
    })

    bot.on('callback_query', async (callbackQuery) => {
        const callback = callbackQuery.data
        const chatId = callbackQuery.message.chat.id

        bot.answerCallbackQuery(callbackQuery.id, { text: Strings.doneCallback })

        if (callback == Callbacks.cancel) {
            await sendMessage({
                chatId,
                text: Messages.creator(),
                buttons: [Buttons.cancel],
                conversation: {
                    step: Steps.creator,
                    creator: null,
                    recipient: null,
                    quantity: null,
                    title: null,
                    summary: null,
                    description: null,
                    image: null,
                    url: null,
                    fund: null
                }
            })
        } else if (callback == Callbacks.confirm) {
            const conversation = conversations[chatId]

            const esr = await buildTransaction(conversation)

            const qrCode = await buildQrCode(esr)

            await sendMessage({
                chatId,
                text: Messages.showQr(),
                conversation: {
                    step: Steps.showQr
                },
                buttons: [Buttons.again]
            })

            await bot.sendPhoto(chatId, qrCode)
        }
    })
}

main()