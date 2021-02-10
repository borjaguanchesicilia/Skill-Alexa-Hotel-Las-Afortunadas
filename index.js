const Alexa = require('ask-sdk-core');
const persistencia = require('./persistencia');
const interceptores = require('./interceptores');
const GIVEN_NAME_PERMISSION = ['alexa::profile:given_name:read'];


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
     async handle(handlerInput) {

        const {attributesManager, serviceClientFactory, requestEnvelope} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();

        const dia = sessionAttributes['dia'];
        const mes = sessionAttributes['mes'];
        const day = sessionAttributes['day'];
        const month = sessionAttributes['month'];

        if(!sessionAttributes['name']){
            try {
                const {permissions} = requestEnvelope.context.System.user;
                if(!permissions)
                    throw { statusCode: 401, message: 'No permissions available' };
                const upsServiceClient = serviceClientFactory.getUpsServiceClient();
                const profileName = await upsServiceClient.getProfileGivenName();
                if (profileName) { sessionAttributes['name'] = profileName;}

            } catch (error) {
                console.log(JSON.stringify(error));
                if (error.statusCode === 401 || error.statusCode === 403) {
                  handlerInput.responseBuilder.withAskForPermissionsConsentCard(GIVEN_NAME_PERMISSION);
                }
            }
        }

        const name = sessionAttributes['name'] ? sessionAttributes['name'] : '';

        const bienvenida = requestAttributes.t('BIENVENIDA', name);
        let mensaje = requestAttributes.t('CHECKIN');

        if(dia && mes){
            if (handlerInput.requestEnvelope.request.locale === 'es-ES') {
                mensaje = requestAttributes.t('FECHAREGISTRO', dia, mes)
            }
        }


        if (day && month) {
            if (handlerInput.requestEnvelope.request.locale === 'en-GB') {
                mensaje = requestAttributes.t('FECHAREGISTRO', day, month)
            }
        }

        return handlerInput.responseBuilder
            .speak(bienvenida + mensaje)
            .reprompt(mensaje)
            .getResponse();
    }
};


const CheckINHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CheckIN';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        let dia = intent.slots.dia.value;
        let mes = intent.slots.mes.resolutions.resolutionsPerAuthority[0].values[0].value.name;

        sessionAttributes['dia'] = dia;
        sessionAttributes['mes'] = mes;

        const name = sessionAttributes['name'] ? sessionAttributes['name'] : '';

        return handlerInput.responseBuilder
            .speak(requestAttributes.t('FECHAREGISTRO', dia, mes))
            .reprompt(requestAttributes.t('AYUDA'))
            .getResponse();
    }
};


const CheckINEnHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CheckINEn';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        let day = intent.slots.day.value;
        let month = intent.slots.month.resolutions.resolutionsPerAuthority[0].values[0].value.name;

        sessionAttributes['day'] = day;
        sessionAttributes['month'] = month;

        const name = sessionAttributes['name'] ? sessionAttributes['name'] : '';

        return handlerInput.responseBuilder
            .speak(requestAttributes.t('FECHAREGISTRO', day, month))
            .reprompt(requestAttributes.t('AYUDA'))
            .getResponse();
    }
};


const HorarioBufetHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HorarioBufet';
    },
    handle(handlerInput) {

        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        const desayuno = requestAttributes.t('HORARIODESAYUNO');
        const alumuerzo = requestAttributes.t('HORARIOALMUERZO');
        const cena = requestAttributes.t('HORARIOCENA');
        const recomendación = requestAttributes.t('RECOMENDACION');
        const horarioBufet = (desayuno + alumuerzo + cena);

        return handlerInput.responseBuilder
            .speak(horarioBufet + recomendación)
            .reprompt(requestAttributes.t('BARPISCINA'))
            .getResponse();
    }
};


const HorarioPiscinaHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HorarioPiscina';
    },
    handle(handlerInput) {

        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        const turno1 = requestAttributes.t('HORARIOMAÑANA');
        const turno2 = requestAttributes.t('HORARIOTARDE1');
        const turno3 = requestAttributes.t('HORARIOTARDE2');
        const recomendación = requestAttributes.t('RECOMENDACION');
        const horarioPiscina = (turno1 + turno2 + turno3);

        if (handlerInput.requestEnvelope.request.locale === 'es-ES') {
                let recomendaciones = recomendacionAleatoria(Actividades);
                return handlerInput.responseBuilder
                    .speak(horarioPiscina + recomendación)
                    .reprompt(recomendacionAleatoria(Actividades))
                    .getResponse();
        }


        if (handlerInput.requestEnvelope.request.locale === 'en-GB') {
                let recomendaciones = recomendacionAleatoria(Activities);

                return handlerInput.responseBuilder
                    .speak(horarioPiscina  + recomendación)
                    .reprompt(recomendacionAleatoria(Activities))
                    .getResponse();
        }



    }
};


const RecomendacionesHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'Recomendaciones';
    },
    handle(handlerInput) {

        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        const recomendación = requestAttributes.t('RECOMENDACION');


        if (handlerInput.requestEnvelope.request.locale === 'es-ES') {
                let recomendaciones = recomendacionAleatoria(Actividades);
                return handlerInput.responseBuilder
                    .speak(recomendaciones + recomendación)
                    .reprompt(recomendacionAleatoria(Actividades))
                    .getResponse();
        }


        if (handlerInput.requestEnvelope.request.locale === 'en-GB') {
                let recomendaciones = recomendacionAleatoria(Activities);
                return handlerInput.responseBuilder
                    .speak(recomendaciones + recomendación)
                    .reprompt(recomendacionAleatoria(Activities))
                    .getResponse();
        }

    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('AYUDA');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('DESPEDIDA');

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};


const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('FALLBACK');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};


const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = requestAttributes.t('REFLECTOR', intentName);

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};


const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('ERROR');

        console.log(`~~~~ Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};


function recomendacionAleatoria(Actividades) {
    return Actividades[Math.floor(Math.random()*Actividades.length)]
}


const Actividades = [
    ' Visite el Parque Nacional del Teide, nuestra joya. Para más información visite www.volcanoteide.com ',
    ' Dé un paseo en velero con avistamiento de cetáceos. Para más información diríjase a Puerto Colón o al puerto de los Gigantes.',
    ' Ha montado alguna vez en moto de agua? Haga un tour en moto de agua por el sur de Tenerife. Para más información diríjase a Puerto Colón.',
    ' Quiere hacer un tour en kayak ? Disfrute de la isla baja y haga un tour en kayak por la Punta de Teno. Para más información contácte con Teno activo.',
    ' Un día diferente ? Disfrute de un día de adrenalina en Siam Park o de un día entre animales en Loro Parque. ',
    ' Aquí, en Tenerife, tenemos numeros barrancos por los que se puede investicar, recorrer y disfrutar, le invito a que haga un tour de los misterios y leyendas del por Barranco de Badajoz (en Güímar) o por el Barranco de Erques (en Fasnia). ',
    ' Un buen plan por la noche es una excursión nocturna por las Cañadas del Teide. Para más información visite www.volcanoteide.com'
];


const Activities = [
    'Visit the Teide National Park, our jewel. For more information visit www.volcanoteide.com ',
    'Go on a sailboat ride with whale watching. For more information, go to Puerto Colón or Puerto de los Gigantes. ',
    'Have you ever ridden a jet ski? Take a jet ski tour in the south of Tenerife. For more information go to Puerto Colón. ',
    'Do you want to go on a kayak tour? Enjoy the isla baja and take a kayak tour of Punta de Teno. For more information contact Teno Activo. ',
    ' A different day ? Enjoy a day of adrenaline at Siam Park or a day with animals at Loro Parque. ',
    'Here, in Tenerife, we have numerous ravines through which you can investigate, walk and enjoy. I suggest you to take a tour of the mysteries and legends of the Barranco de Badajoz (in Güímar) or the Barranco de Erques (in Fasnia). ',
    'A good plan at night is a night excursion through the Cañadas del Teide. For more information visit www.volcanoteide.com '
];


exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CheckINHandler,
        CheckINEnHandler,
        HorarioPiscinaHandler,
        HorarioBufetHandler,
        RecomendacionesHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
        .addRequestInterceptors(
            interceptores.LocalizationRequestInterceptor,
            interceptores.LoggingRequestInterceptor,
            interceptores.LoadAttributesRequestInterceptor)
        .addResponseInterceptors(
            interceptores.LoggingResponseInterceptor,
            interceptores.SaveAttributesResponseInterceptor)
        .withPersistenceAdapter(persistencia.getPersistenceAdapter())
        .withApiClient(new Alexa.DefaultApiClient())
        .lambda();
