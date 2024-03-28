// ==UserScript==
// @name         Bitrix24 Convert Input To Select
// @namespace    https://crm.globaldrive.ru/
// @version      0.0.2
// @description  Tasks doesn't have dropdown lists in our version of B24, this scripts solves this problem.
// @author       Dzorogh
// @match        https://crm.globaldrive.ru/*
// @require      https://cdn.jsdelivr.net/npm/public-google-sheets-parser@latest
// @grant        GM_addStyle
// @downloadURL  https://raw.githubusercontent.com/Dzorogh/bitrix24-user-scripts/main/tasks-convert-input-to-select.js
// @updateURL    https://raw.githubusercontent.com/Dzorogh/bitrix24-user-scripts/main/tasks-convert-input-to-select.js
// ==/UserScript==

(function() {
    const lsKey = 'convertInputToSelectSheetId';

    let sheetId = localStorage.getItem(lsKey);

    if (!sheetId || sheetId === 'null') {
        sheetId = prompt('Please enter Google Sheet Id');
        if (sheetId) {
            localStorage.setItem(lsKey, sheetId);
        }
    }

    if (!sheetId) {
        console.error('No sheet ID provided');
        return false;
    }

    const parseExcel = (sheetId, sheetName) => {
        const parser = new PublicGoogleSheetsParser(sheetId, { sheetName })
        const parserData = await parser.parse();

        console.log('convertInputToSelect: parserData', parserData)

        if (!parserData.length) {
            localStorage.removeItem(lsKey);
        }

        return parserData
    }
    
    async function convertInputToSelect(sheetId, sheetName, fieldId) {
        const parser = new PublicGoogleSheetsParser(sheetId, { sheetName })
        const parserData = await parser.parse();

        console.log('convertInputToSelect: parserData', parserData)

        if (!parserData.length) {
            localStorage.removeItem(lsKey);
        }

        const options = parserData.map((item) => {
            return item.value;
        })

        console.log('convertInputToSelect: options', options)

        const defaultOption = parserData.find((item) => {
            return item.is_default == 1;
        })

        console.log('convertInputToSelect: defaultOption', defaultOption)

        const inputElement = document.querySelector(`input[name*='${fieldId}']`);

        if (!inputElement) {
            console.error(inputElement)
            throw new Error('Element not found')
        }

        const copyAttsTo = (from, to) => {
            const attrs = from.attributes;

            for (const attr of attrs) {
                if (attr.name !== 'size') {
                    to.setAttribute(attr.name, attr.value);
                }
            }
        }
        

        const newSelectElement = document.createElement("select");

        copyAttsTo(inputElement, newSelectElement);

        inputElement.replaceWith(newSelectElement);

        newSelectElement.style.width = '100%';

        options.unshift('')

        options.forEach((option) => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;

            if (inputElement.value === option) {
                optionElement.selected = true;
            } else if (!inputElement.value && defaultOption && defaultOption.value === option) {
                optionElement.selected = true;
            }

            newSelectElement.append(optionElement);
        })
    }

    convertInputToSelect(sheetId, 'Companies', 'UF_AUTO_555825536710');

    convertInputToSelect(sheetId, 'Projects', 'UF_AUTO_231937255950');

    convertInputToSelect(sheetId, 'Types', 'UF_AUTO_692505608773');

    convertInputToSelect(sheetId, 'Priorities', 'UF_AUTO_367625648403');
    
})();