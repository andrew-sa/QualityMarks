const logger = require('loglevel')
const connection = require('./connection')

module.exports = async function (request, response){
    var citta = request.body.query
    var nazione = request.body.nazione
    var regione = request.body.regione
    var provincia = request.body.provincia
    var mese = request.body.mese
    var categoria = request.body.categoria
    var ordinamento = request.body.ordinamento
    var ordinamentoModo = request.body.ordinamentoModo

    /*  QUERY:

            PREFIX prodotti-qualita: <http://www.semanticweb.org/progettoWS/prodotti-qualita#>
            PREFIX l0: <https://w3id.org/italia/onto/l0/>

            SELECT ?titolo, ?indirizzo, ?organizzatore, ?mese, ?sitoWeb, ?nomeCitta, ?nomeProvincia, ?nomeRegione, ?nomeNazione

            FROM NAMED <http://localhost:8890/cities>
            FROM NAMED <http://localhost:8890/provinces>
            FROM NAMED <http://localhost:8890/regions>
            FROM NAMED <http://localhost:8890/italy>

            WHERE{
                ?individual a prodotti-qualita:Evento.
                
                ?individual prodotti-qualita:citta ?citta.
                GRAPH ?g1{
                    ?citta l0:name ?nomeCitta.
                    opt FILTER(regex(str(?nomeCitta), "citta", "i"))
                }

                ?individual prodotti-qualita:nazione ?nazione.
                GRAPH ?g2{
                    ?nazione l0:name ?nomeNazione.
                    FILTER(LANG(?nomeNazione) = "it")
                    opt FILTER(str(?nomeNazione) = "nazione")
                }

                ?individual prodotti-qualita:regione ?regione.
                GRAPH ?g3{
                    ?regione l0:name ?nomeRegione.
                    opt FILTER(str(?nomeRegione) = "regione")
                }

                ?individual prodotti-qualita:provincia ?provincia.
                GRAPH ?g4{
                    ?provincia l0:name ?nomeProvincia.
                    opt FILTER(str(?nomeProvincia) = "provincia")
                }

                ?individual prodotti-qualita:nelMese ?mese.
                opt FILTER(?mese = "mese")
                
                ?individual prodotti-qualita:haTitolo ?titolo.
                ?individual prodotti-qualita:haIndirizzo ?indirizzo.
                ?individual prodotti-qualita:organizzatore ?organizzatore.
                ?individual prodotti-qualita:haSitoWeb ?sitoWeb.
            }
            ORDER BY ASC/DESC("variabile")
    */

    var query = `SELECT ?titolo, ?indirizzo, ?organizzatore, ?mese, ?sitoWeb, ?nomeCitta, ?nomeProvincia, ?nomeRegione, ?nomeNazione

                 FROM NAMED <http://localhost:8890/cities>
                 FROM NAMED <http://localhost:8890/provinces>
                 FROM NAMED <http://localhost:8890/regions>
                 FROM NAMED <http://localhost:8890/italy>

                 WHERE{
                    ?individual a prodotti-qualita:Evento.
                    
                    ?individual prodotti-qualita:citta ?citta.
                    GRAPH ?g1{
                        ?citta l0:name ?nomeCitta.`

    if(citta) {
        query += 'FILTER(regex(str(?nomeCitta), "' + citta + '", "i"))'
    }
            
    query += `}
            ?individual prodotti-qualita:nazione ?nazione.
            GRAPH ?g2{
                ?nazione l0:name ?nomeNazione.
                FILTER(LANG(?nomeNazione) = "it")`

    if(nazione) {
        query += 'FILTER(str(?nomeNazione) = "' + nazione + '")'
    }

    query += `}
            ?individual prodotti-qualita:regione ?regione.
            GRAPH ?g3{
                ?regione l0:name ?nomeRegione.`

    if(regione) {
        query += 'FILTER(str(?nomeRegione) = "' + regione + '")'
    }

    query += `}
            ?individual prodotti-qualita:provincia ?provincia.
            GRAPH ?g4{
                ?provincia l0:name ?nomeProvincia.`

    if(provincia) {
        query += 'FILTER(str(?nomeProvincia) = "' + provincia + '")'
    }

    query += `}
            ?individual prodotti-qualita:nelMese ?mese.`

    if(mese) {
        query += 'FILTER(?mese = "' + mese + '")'
    }

    query += `?individual prodotti-qualita:haTitolo ?titolo.
              ?individual prodotti-qualita:haIndirizzo ?indirizzo.
              ?individual prodotti-qualita:organizzatore ?organizzatore.
              ?individual prodotti-qualita:haSitoWeb ?sitoWeb.
            }`

    query += 'ORDER BY ' + ordinamentoModo + '(?' + ordinamento + ')'

    connection.query(query, true)
        .then((res) => {
            res.results.bindings.forEach(x => x['categoria'] = {value: "TODO"})
            // Dato il nome della classe ottenere il nome visualizzabile dall'annotazione

            logger.info(res.results.bindings)
            response.send(res.results.bindings)
        })
        .catch((err) => {
            logger.error(err)
        })
}