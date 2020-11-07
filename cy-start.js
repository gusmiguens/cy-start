const cypress = require('cypress');
const program = require('commander');
const config = require('./__tests__/ui/support/devices');
const OSconfig = require('./__tests__/ui/support/os');

program
    .version('0.1.0')
    .option('-d, --device <device>', 'run tests on device: <device>')
    .option('-osV, --osVersion <osVersion>', 'adds device OS version')
    .option('-r, --record', 'records the run in the Cypress dashboard')
    .option('-o, --open', 'opens cypress');

program
    .on('--help', function () {
        console.log('');
        console.log('Full example for a local run: device viewport + os version');
        console.log('  $ node cy-start.js -- -d iphoneX -osV 13.3.1');
        console.log('');
        console.log('Full example for a recorded run: (opt) device viewport + (opt) os version + -r');
        console.log('  $ node cy-start.js -- -d iphoneX -osV 13.3.1 -r');
        console.log('');
        console.log('Device viewport list: ');
        console.log(Object.keys(config));
        console.log('');
        console.log('iOS versions available: ');
        console.log(Object.keys(OSconfig['iOS']));
        console.log('');
        console.log('android versions available: ');
        console.log(Object.keys(OSconfig['android']));
    });

program.parse(process.argv);

const device = config[program.device] ? program.device : 'default';
const osType = device.indexOf('iphone') > -1 ? 'iOS' : device === 'default' ? 'default' : 'android';
const osVersion = OSconfig[osType][program.osVersion] ? program.osVersion : 'default';
const userAgent = OSconfig[osType][osVersion];

const cypressOptions = {
    env: {
        device,
        osType,
        osVersion
    },
    config: {
        ...config[device],
        userAgent,
        integrationFolder: '__tests__/ui/__specs__/functional'
    },
    browser: 'chrome',
    headless: true
};

function runCypress() {
    const run = program.open ? cypress.open(cypressOptions)
        : program.record ? cypress.run({
            record: true,
            key: process.env.CYPRESS_KEY,
            ...cypressOptions,
        })
            : cypress.run(cypressOptions);

    return run;
}

runCypress()
    .then(results => {
        if (results.totalFailed > 0 || results.failures > 0) {
            process.exit(1);
        }
    })
    .catch(err => {
        console.error(err.stack || err);
        process.exit(1);
    });
