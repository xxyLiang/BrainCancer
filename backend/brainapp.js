var neo4j = require('neo4j-driver');
var express = require('express');

var driver = neo4j.driver(
    'neo4j://localhost/',
    neo4j.auth.basic('neo4j', 'lumen')
);

var app = express();

app.get('/', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send('');
})

app.get('/get', function(req, res) {
    let drug = req.query.drug;
    if (drug != undefined && drug.length > 0) {
        let session = driver.session({ defaultAccessMode: neo4j.session.READ });
        let match_string = "MATCH (n1:`药物`)-[r:`相互作用`]-(n2:`药物`) where n1.value='" + drug + "' return n1,r,n2 limit 5";
        session
            .run(match_string)
            .then(result => {
                var r = { "relations": [], "subjectInfo": {}, };
                result.records.forEach(record => {
                    var temp = {};
                    let count = 0;
                    if (count == 0) {
                        r.subjectInfo['name'] = record.get('n1').properties.value
                        if (record.get('n1').properties.hasOwnProperty('indication')) {
                            r.subjectInfo['indication'] = record.get('n1').properties.indication
                        }
                        count = 1
                    }
                    temp['object'] = record.get('n2').properties.value
                    if(typeof(record.get('r').properties.level) == 'string'){
                        temp['level'] = record.get('r').properties.level
                    } else {
                        temp['level'] = record.get('r').properties.level.low
                    } 
                    temp['statement'] = record.get('r').properties.statement
                    if (record.get('r').properties.hasOwnProperty('intro')) {
                        temp['intro'] = record.get('r').properties.intro
                    }
                    r.relations.push(temp);
                });
                res.header('Access-Control-Allow-Origin', '*');
                res.send(JSON.stringify(r));
            })
            .then(() => session.close())
    } else {
        res.send('{}');
    }

})

app.listen(8080, function() {
    console.log('app is runing at port 8080')
})