const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

module.exports = {

    LoggingRequestInterceptor: {
        process(handlerInput) {
            console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
        }
    },


    LoggingResponseInterceptor: {
        process(handlerInput, response) {
        console.log(`Outgoing response: ${JSON.stringify(response)}`);
        }
    },


    LocalizationRequestInterceptor: {
        process(handlerInput) {
            const localizationClient = i18n.use(sprintf).init({
                lng: handlerInput.requestEnvelope.request.locale,
                overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
                resources: require('./frases'),
                returnObjects: true
            });
            const attributes = handlerInput.attributesManager.getRequestAttributes();
            attributes.t = function (...args) {
                return localizationClient.t(...args);
            }
        }
    },


    LoadAttributesRequestInterceptor: {
        async process(handlerInput) {
            if(handlerInput.requestEnvelope.session['new']){
                const {attributesManager} = handlerInput;
                const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
                handlerInput.attributesManager.setSessionAttributes(persistentAttributes);
            }
        }
    },


    SaveAttributesResponseInterceptor: {
        async process(handlerInput, response) {
            const {attributesManager} = handlerInput;
            const sessionAttributes = attributesManager.getSessionAttributes();
            const shouldEndSession = (typeof response.shouldEndSession === "undefined" ? true : response.shouldEndSession);
            if(shouldEndSession || handlerInput.requestEnvelope.request.type === 'SessionEndedRequest') {
                attributesManager.setPersistentAttributes(sessionAttributes);
                await attributesManager.savePersistentAttributes();
            }
        }
    }
}
