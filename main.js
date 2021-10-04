//Interface utilisateur pour ajouter un autobus, supprimer un autobus, effectuer une recherche

import inquirer from 'inquirer';

import { currentAgencies, loadAgencyFromDatabase, writeAgencyToDatabase } from './database.js';
import { Agency, Bus } from './model.js';

const agency_questions = [
    {
        name: 'choice',
        type: 'list',
        message: 'Que voulez-vous faire? (utilisez les flèches et la touche « retour » pour sélectionner):',
        choices: ['Ajouter un autobus', 'Supprimer un autobus', 'Modifier un autobus', 'Montrer l\'inventaire d\'autobus', 'Effectuer une recherche', 'Quitter l\'application'],
    }
];

const add_an_agency_questions = [
    {
        name: 'name',
        type: 'input',
        message: 'Quel est le nom complet de l\'agence?'
    },
    {
        name: 'shortName',
        type: 'input',
        message: 'Quelle est l\'abréviation du nom de l\'agence? (ex: stm)'
    }
];

const add_a_bus_questions = [
    {
        name: 'id',
        type: 'number',
        message: 'Quel est le numéro l\'identifiant de l\'autobus (nombre, sans espaces ni caractères spéciaux)?'
    },
    {
        name: 'license',
        type: 'input',
        message: 'Quel est le numéro de plaque d\'immatriculation de l\'autobus (La lettre A suivi d\'un nombre, sans espaces ni caractères spéciaux)?'
    },
    {
        name: 'make',
        type: 'input',
        message: 'Quel est le fabriquant de l\'autobus (doit contenir au moins une lettre)?'
    },
    {
        name: 'model',
        type: 'input',
        message: 'Quel est le modèle de l\'autobus?'
    },
    {
        name: 'seatCount',
        type: 'number',
        message: 'Combien y a-t-il de places assises (nombre) ?'
    },
    {
        name: 'standingCapacity',
        type: 'number',
        message: 'Combien y a-t-il de places debout (nombre) ?'
    },
    {
        name: 'doorCount',
        type: 'number',
        message: 'Combien y a-t-il de portes?'
    },
    {
        name: 'accessCount',
        type: 'number',
        message: 'Combien y a-t-il d\'accès (il ne devrait pas y avoir plus d\'accès que de portes)?'
    },
];

const search_bus_question = [
    {
        name : 'choice',
        type : 'list',
        message:'Chercher l\'information de l\'autobus par :',
        choices : ['Numéro d\'identifiant', 'Numéro de plaque d\'immatriculation']
    }
];

var currentAgency = null;

async function ask_agency_questions() {
    const result = await inquirer.prompt(agency_questions);

    if (result.choice === 'Ajouter un autobus' || 
        result.choice === 'Supprimer un autobus' || 
        result.choice === 'Effectuer une recherche' || 
        result.choice === 'Montrer l\'inventaire d\'autobus') {
        if (currentAgency.busInventory.length == 0) {
            console.log("Il n'y a aucun autobus dans l'inventaire. Ce choix est invalide.");
            ask_agency_questions();
            return;
        }
    }

    if (result.choice === 'Ajouter un autobus') {
        ask_add_a_bus_questions();
    } else if (result.choice === 'Supprimer un autobus') {
        ask_delete_a_bus_questions();
    } else if (result.choice === 'Modifier un autobus') {
        const busChoices = generate_list_of_bus_choices();
        const result = await inquirer.prompt({
            name: 'bus_id',
            type: 'list',
            message: 'Veuillez choisir l\'autobus à modifier:',
            choices: busChoices
        })
        ask_modify_a_bus_questions(result.bus_id);
    } else if (result.choice == 'Effectuer une recherche') {
        ask_search_bus_question();
    } else if (result.choice === 'Montrer l\'inventaire d\'autobus') {
        show_bus_inventory();
    } else if (result.choice == 'Quitter l\'application') {
        process.exit()
    }
}

function generate_list_of_bus_choices() {
    const busChoices = [];
    
    for (const bus of currentAgency.busInventory) {
        busChoices.push({'name': `Bus #${bus.id}: ${bus.license}, ${bus.make} ${bus.model}`, 'value': bus.id});
    }

    return busChoices;
}

function displayBus(bus) {
    console.log(`Bus #${bus.id}`);
    console.log(`Numéro d'immatriculation #${bus.license}`);
    console.log(`${bus.make}`);
    console.log(`Modèle ${bus.model}`);
    console.log(`${bus.seatCount} places assises`);
    console.log(`${bus.standingCapacity} places debout`);
    console.log(`${bus.doorCount} portes`);
    console.log(`${bus.accessCount} voies d'accès`);
    console.log('');
}

async function show_bus_inventory() {
    // Par défault on veut trier selon le numéro d'identification
    // et on affiche les résultats en ordre croissant.
    let ascendingOrder = true;
    let sortBy = 'id';
    while (true) {
        // Ce code permet de trier la liste d'autobus selon un attribut spécifique.
        let inventory = currentAgency.busInventory.slice();
        inventory.sort(function(a, b) {
            return a[sortBy].toString().localeCompare(b[sortBy])
        });

        if (!ascendingOrder) {
            inventory = inventory.reverse();
        }

        for (const bus of inventory) {
            displayBus(bus);
        }

        const result = await inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                loop: false,
                message: 'Que voulez-vous faire?',
                choices: [
                    {'name': `Trier par numéro d'identification`, 'value': 'id'},
                    {'name': `Trier par numéro d'immatriculation`, 'value': 'license'},
                    {'name': `Trier par fabriquant`, 'value': 'make'},
                    {'name': `Trier par modèle`, 'value': 'model'},
                    {'name': `Trier par nombre de places assises`, 'value': 'seatCount'},
                    {'name': `Trier par nombre de places debout`, 'value': 'standingCapacity'},
                    {'name': `Trier par nombre de portes`, 'value': 'doorCount'},
                    {'name': `Trier par nombre de voies d'accès`, 'value': 'accessCount'},
                    {'name': `Inverser l'ordre de présentation`, 'value': 'invertOrder'},
                    {'name': `Retourner au menu précédent`, 'value': 'menu'}
                ],
            }
        ])
        if (result.choice === 'menu') {
            ask_agency_questions();
            return;
        } else if (result.choice === 'invertOrder') {
            ascendingOrder = !ascendingOrder;
        } else {
            sortBy = result.choice;
            show_bus_inventory(result.choice);
        }
    }
}

async function ask_add_a_bus_questions() {
    const choices = await inquirer.prompt(add_a_bus_questions);
    if (
        (isNaN(choices.id) === false) && 
        ((choices.license.substring(0,1) === 'A' || choices.license.substring(0,1) === 'a') ===true ) && 
        (isNaN(choices.license.substring(1)) === false) &&
        (isNaN(choices.make) === true) &&
        (isNaN(choices.seatCount) === false) && 
        (isNaN(choices.standingCapacity) === false) && 
        (choices.seatCount + choices.standingCapacity < 210) && // où un bus articulé peut avoir plus de 190 personnes
        (choices.doorCount < 8) && // Ex. le rare bus MAN articulé version longue
        ((choices.accessCount > choices.doorCount) === false)
    ) {
        const newBus = new Bus(choices);
        try {
            currentAgency.addBusToInventory(newBus);
        } catch (error) { // A bus with this ID probably already exists.
            console.log(error);
            ask_add_a_bus_questions();
            return;
        }
        writeAgencyToDatabase(currentAgency);
        console.log("L'autobus a été ajouté.");
        ask_top_menu_questions();
    } else {
        console.log('Le format des données ne respecte pas les consignes, veuillez entrez les informations à nouveau.');
        ask_add_a_bus_questions();
    }
}

async function ask_delete_a_bus_questions() {
    if (currentAgency.busInventory.length == 0) {
        console.log("Il n'y a aucun autobus à supprimer.");
        ask_agency_questions();
        return;
    }

    const busChoices = generate_list_of_bus_choices();
    const result = await inquirer.prompt({
        name: 'bus_id',
        type: 'list',
        message: 'Veuillez choisir l\'autobus à supprimer:',
        choices: busChoices
    })
    
    const busObject = currentAgency.getBusById(result.bus_id);
    currentAgency.removeBusFromInventory(busObject);
    
    writeAgencyToDatabase(currentAgency);
    console.log("Le bus a été supprimé.\n");
    
    ask_agency_questions();
}

async function ask_modify_a_bus_questions(bus_id) {
    const bus = currentAgency.getBusById(bus_id);

    const modify_a_bus_questions = [
        {
            name: 'attribute',
            type: 'list',
            loop: false,
            message: 'Quel attribut voulez-vous modifier?',
            choices: [
                {'name': `Numéro d\'identification (${bus.id})`, 'value': 'id'},
                {'name': `Numéro d\'immatriculation (${bus.license})`, 'value': 'license'},
                {'name': `Fabriquant (${bus.make})`, 'value': 'make'},
                {'name': `Modèle (${bus.model})`, 'value': 'model'},
                {'name': `Nombre de places assises (${bus.seatCount})`, 'value': 'seatCount'},
                {'name': `Nombre de places debout (${bus.standingCapacity})`, 'value': 'standingCapacity'},
                {'name': `Nombre de portes (${bus.doorCount})`, 'value': 'doorCount'},
                {'name': `Nombres de voies d'accès (${bus.accessCount})`, 'value': 'accessCount'}
            ]
        }
    ];

    const result = await inquirer.prompt(modify_a_bus_questions);
    const output = await inquirer.prompt({'message': "Quelle est la nouvelle valeur?", 'name': 'new_value'});
    
    bus[result.attribute] = output.new_value;
    writeAgencyToDatabase(currentAgency);
    console.log("La modification a été enregistrée.\n");
    
    ask_agency_questions();
}

async function ask_search_bus_question() {
    const result = await inquirer.prompt(search_bus_question);
    let searchResults = null;

    if (result.choice === 'Numéro d\'identifiant') {
        const output = await inquirer.prompt({name: 'search_id', message: 'Entrez le numéro d\'identifiant:', type: 'number'})
        searchResults = currentAgency.busInventory.filter((bus) => bus.id === output.search_id);
    } else {
        const output = await inquirer.prompt({name: 'search_license', message: 'Entrez le numéro de plaque d\'immatriculation:'})
        searchResults = currentAgency.busInventory.filter((bus) => bus.license === output.search_license);
    }

    if (searchResults.length >= 1) {
        for (const bus of searchResults) {
            displayBus(bus);
        }
    } else {
        console.log("Aucun résultat.\n");
    }
    
    ask_agency_questions();
}

async function ask_top_menu_questions() {
    const choices = ['Créer une nouvelle agence'];
    if (currentAgencies.length > 0) {
        // Only display this choice if there are agencies to be loaded.
        choices.push('Choisir une agence existante');
    }
    choices.push('Quitter l\'application');

    const top_menu_questions = {
            name: 'choice',
            type: 'list',
            message: 'Que voulez-vous faire? (utilisez les flèches et la touche « retour » pour sélectionner):',
            choices: choices,
    };
    const result = await inquirer.prompt(top_menu_questions);

    if (result.choice === 'Choisir une agence existante') {
        const agencyChoices = [];
        for (const agency of currentAgencies) {
            agencyChoices.push({'name': `${agency.name} (${agency.shortName})`, 'value': `${agency.shortName}`});
        }

        const result = await inquirer.prompt({
            name: 'agencyShortName',
            type: 'list',
            message: 'Veuillez choisir une agence (utilisez les flèches et la touche « retour » pour sélectionner):',
            choices: agencyChoices
        });

        currentAgency = loadAgencyFromDatabase(result.agencyShortName);
        ask_agency_questions();
    } else if (result.choice === 'Créer une nouvelle agence') {
        const answers = await inquirer.prompt(add_an_agency_questions);

        if (answers.shortName === '' ||
            answers.name === '') {
                console.log("Valeurs invalides!");
                return;
        }

        for (const agency of currentAgencies) {
            // We use .toUpperCase() to do a case-insensitive comparison.
            if (agency.shortName.toUpperCase() === answers.shortName.toUpperCase()) {
                // This agency already exists!
                console.log("Cette agence existe déjà.");
                return;
            }
        }
        // The variable 'answers' will contain a value for answers.name and answers.shortName, which is
        // exactly what the constructor of Agency wants.
        currentAgency = new Agency(answers);
        writeAgencyToDatabase(currentAgency);

        ask_agency_questions();
    } else if (result.choice === 'Quitter l\'application') {
        process.exit()
    }
}

ask_top_menu_questions();
