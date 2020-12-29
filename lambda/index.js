/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
var http = require('https');
// Mensajes genéricos, traducir
const saludoBienvenida = 'Bienvenido, esta skill de Alexa te permite recuperar algunos datos agregados de ofertas tipo capei desde SAP S4HANA. Qué te gustaría saber?';
const mensajeContinuacion = 'Te gustaría saber alguna cosa más?';
const despedida = 'Hasta la próxima!';
const mensajeError = 'Perdona, no he podido hacer eso que me has pedido. Pruéba de nuevo, por favor.';
const mensajeAyuda = 'You can say hello to me! How can I help?';
//Este  mensaje se lanza cuando no hay ningun intent (forma de interactuar del usuario que lanza una acción) que responda a lo que se ha dicho
const ningunIntentEncontrado = 'Perdona, eso lo desconozco. Prueba a preguntar otra cosa...'; 
const URL = "sapqas.idom.com:443"
var optionsGet = {
    "usuario" : "JAIMEHERNA00",
    "contraseña": "RZ7Zgknd.-",
    "x-csrf-token": "fetch",
    "Content-Type": "application/json",
    "type": "GET",
    "ofertasTotales": "/sap/opu/odata/sap/Z_ODATA_CDS_WPARTNER_SRV/ZCDS_PROP_PARTNERNAMES/$count",
    "ultimaOferta": "/sap/opu/odata/sap/Z_ODATA_CDS_WPARTNER_SRV/ZCDS_PROP_PARTNERNAMES?$orderby=Createdon%20desc&$top=1&$format=json",
    "ultimaAdjudicacion": "/sap/opu/odata/sap/Z_ODATA_CDS_WPARTNER_SRV/ZCDS_PROP_PARTNERNAMES?$top=1&$orderby=Lastchangedon desc&$filter=Status eq 'AW' &$format=json"
};
//La autorizaciópn de debajo se utiliza en el m´doulo http.request, para los POST
var sAuth = 'Basic ';
sAuth += new Buffer(optionsGet.username + ':' + optionsGet.password).toString('base64');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        //const speakOutput = 'Welcome, you can say Hello or Help. Which would you like to try?';

        return handlerInput.responseBuilder
            .speak(saludoBienvenida)
            .reprompt(saludoBienvenida)
            .getResponse();
    }
};

const getTotalProposalsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'getTotalProposalsIntent';
    },
    async handle(handlerInput) {
       
        try {
            const response = await getHttp(URL, optionsGet);
            const speakOutput = 'Tienes un total de ' + response + ' ofertas en el sistema.';
           
            handlerInput.responseBuilder
                .speak(speakOutput + mensajeContinuacion)
                .reprompt(mensajeContinuacion)
               
        } catch(error) {
            handlerInput.responseBuilder
            console.log('Error en la llamada al total de ofertas:', error);
            
            return handlerInput.responseBuilder
                .speak(`Hubo un error en la llamada al sistema, ponte en contacto con el equipo técnico por favor. ${mensajeContinuacion}`)
                .reprompt(mensajeContinuacion);
        }
       
        return handlerInput.responseBuilder
            .getResponse();
    }
    
};

const getHttp = function(url, options) {
    return new Promise((resolve, reject) => {
        const request = http.get(`https://${options.usuario}:${options.contraseña}@${url}/${options.ofertasTotales}`, response => {
            response.setEncoding('utf8');
           
            let returnData = '';
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
            }
           
            response.on('data', chunk => {
                returnData += chunk;
            });
           
            response.on('end', () => {
                resolve(returnData);
            });
           
            response.on('error', error => {
                reject(error);
            });
        });
        request.end();
    });
};
const getLastProposalIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'getLastProposalIntent';
    },
    async handle(handlerInput) {
       
        try {
            const response = await getHttpUltima(URL, optionsGet);

            const speakOutput = 'La última oferta, con código ' + JSON.parse(response).d.results[0].Propcode + ' con nombre ' + JSON.parse(response).d.results[0].Nombreoferta +
                                ' cuyo responsable es ' + JSON.parse(response).d.results[0].Respname + ' y director de proyecto ' + JSON.parse(response).d.results[0].Pmname + ', se desarrolla en ' +  JSON.parse(response).d.results[0].Landx50 + 
                                ' y el cliente se llama ' +  JSON.parse(response).d.results[0].Organizacion + '. '  ;
           
            handlerInput.responseBuilder
                .speak(speakOutput + mensajeContinuacion)
                .reprompt(mensajeContinuacion)
               
        } catch(error) {
            handlerInput.responseBuilder
            console.log('Error en la llamada a la última oferta:', error);
            
            return handlerInput.responseBuilder
                .speak(`Hubo un error en la llamada al sistema, ponte en contacto con el equipo técnico por favor. ${mensajeContinuacion}`)
                .reprompt(mensajeContinuacion);
        }
       
        return handlerInput.responseBuilder
            .getResponse();
    }
    
};

const getHttpUltima = function(url, options) {
    return new Promise((resolve, reject) => {
        const request = http.get(`https://${options.usuario}:${options.contraseña}@${url}/${options.ultimaOferta}`, response => {
            response.setEncoding('utf8');
           
            let returnData = '';
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
            }
           
            response.on('data', chunk => {
                returnData += chunk;
            });
           
            response.on('end', () => {
                resolve(returnData);
            });
           
            response.on('error', error => {
                reject(error);
            });
        });
        request.end();
    });
};

//Query de la última oferta que se ha adjudicado
//https://erp.idom.com/sap/opu/odata/sap/Z_ODATA_CDS_WPARTNER_SRV/ZCDS_PROP_PARTNERNAMES?$top=1&$orderby=Lastchangedon desc&$filter=Status eq 'AW'
const getLastAdjudicationIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'getLastAdjudicationIntent';
    },
    async handle(handlerInput) {
       
        try {
            const response = await getHttpUltimaAdjudicacion(URL, optionsGet);

            const speakOutput = 'La última oferta que se ha ganado, con código ' + JSON.parse(response).d.results[0].Propcode + ' con nombre ' + JSON.parse(response).d.results[0].Nombreoferta +
                                ' cuyo responsable es ' + JSON.parse(response).d.results[0].Respname + ' y director de proyecto ' + JSON.parse(response).d.results[0].Pmname + ', se desarrolla en ' +  JSON.parse(response).d.results[0].Landx50 + 
                                ' y el cliente se llama ' +  JSON.parse(response).d.results[0].Organizacion + '. '  ;
           
            handlerInput.responseBuilder
                .speak(speakOutput + mensajeContinuacion)
                .reprompt(mensajeContinuacion)
               
        } catch(error) {
            handlerInput.responseBuilder
            console.log('Error en la llamada a la última oferta adjudicada:', error);
            
            return handlerInput.responseBuilder
                .speak(`Hubo un error en la llamada al sistema, ponte en contacto con el equipo técnico por favor. ${mensajeContinuacion}`)
                .reprompt(mensajeContinuacion);
        }
       
        return handlerInput.responseBuilder
            .getResponse();
    }
    
};

const getHttpUltimaAdjudicacion = function(url, options) {
    return new Promise((resolve, reject) => {
        const request = http.get(`https://${options.usuario}:${options.contraseña}@${url}/${options.ultimaAdjudicacion}`, response => {
            response.setEncoding('utf8');
           
            let returnData = '';
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
            }
           
            response.on('data', chunk => {
                returnData += chunk;
            });
           
            response.on('end', () => {
                resolve(returnData);
            });
           
            response.on('error', error => {
                reject(error);
            });
        });
        request.end();
    });
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        //const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(mensajeAyuda)
            .reprompt(mensajeAyuda)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        //const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(despedida)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        //const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(ningunIntentEncontrado)
            .reprompt(ningunIntentEncontrado)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Recuperando información de ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(mensajeError)
            .reprompt(mensajeError)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        getTotalProposalsIntentHandler,
        getLastProposalIntentHandler,
        getLastAdjudicationIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();