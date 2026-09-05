import * as Excel from 'exceljs';
import { saveAs } from 'file-saver';

const title = ['PACKING LIST'];
const headers = [
    '1. Shipper/Exporter',
    '2. Consignee',
    '3. Notify Party',
    '4. Port of Loading',
    '5. Sailing on or about',
    '6. Carrier',
    '7. Final Destination',
    '8. No. & Date of Invoice',
    '9. Payment Terms and Conditions',
    '10. Freight Term',
    '11. Remarks',
    'Mark & No.Pkgs',
    'Carton',
    'No.',
    'Items',
    'Qty',
    'C/T',
    'Quantity',
    '(Unit)',
    'Weight(KG)',
    'Net / Gross',
    'Volume(CBM)',
    'Net / Gross',

]
const description = {
    1: {
        shipper: 'NEXUS ELECTRONICS CO., LTD.',
        tel: '               TEL : +82-(0)31-789-0123',
        address1: '#1204, Pangyo Techno-Valley',
        address2: 'Pangyoyeok-ro 146beon-gil, Bundang-gu, Seongnam-si 13494, KOREA'
    },
    2: {
        Consignee: 'GLOBAL DYNAMICS INC.',
        address1: '1000 Techland Blvd, Suite 400, Austin, TX 78701 USA.',
        address2: 'Tel: 512-555-0199   Alex Morgan, alex.m@globaldynamics.io'
    },
    3: {
        'Party': 'GLOBAL DYNAMICS INC.',
        address1: 'Tel: 512-555-0199   Sarah Jenkins, logistics@globaldynamics.io',
    },
    4: {
        'Port': ['BUSAN PORT', 'INCHOEN AIR PORT'],
    },
    5: {
        'Sailing': '',
    },
    6: {
        Carrier: '',
    },
    7: {
        'Destination': 'Dallas, Texas USA.',
    },
    8: {
        'NO&Date': '',
        page1: '1 OF 1',
        page2: '2 OF 2'
    },
    9: {
        'Payment': 'T/T Net 30days',
    },
    10: {
        'Term': ['FOB BUSAN PORT IN KOREA', 'CIF'],
    },
    11: {
        'Remarks1': `A. This shipment doesn't contain `,
        'Remarks2': `solid wooden packing material.`,
        'Forwarder': 'B. '
    },
}

const columnWidths = [20, 7.5, 23.5, 3.5, 4.5, 4.63, 5.1, 6.63, 5.25, 5.6]
export interface CartonPackingItem {
    itemName: string;
    CT_qty: number;
    quantity: number;
    weight: number;
    moq: number;
    cbm: number;
    sets: string;
}

export type PalletDataType = {
    [key: number]: {
        [key: string]: string | number;
        item: string;
        CT_qty: number;
        weight: number;
        cbm: number;
        moq: number;
    }[];
};

const styleTitleCell = (cell: Excel.Cell) => {
    cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
    };
};

export const generateCartonPackingExcel = async (
    type: string,
    packingData: CartonPackingItem[] | undefined,
    palletData: PalletDataType
) => {
    let rowCount = 0;
    if (packingData) {
        rowCount = packingData.length;
    }
        try {
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('Packing', { pageSetup: { paperSize: 9, margins: { left: 0, right: 0, top: 0, bottom: 0, header: 0, footer: 0 } } });
            // worksheet.getColumn(1).style.font = { size: 9 }
            worksheet.columns = [
                { header: '', key: '', width: columnWidths[0] + 0.58 },
                { header: '', key: '', width: columnWidths[1] + 0.58 },
                { header: '', key: '', width: columnWidths[2] + 0.58 },
                { header: '', key: '', width: columnWidths[3] + 0.58 },
                { header: '', key: '', width: columnWidths[4] + 0.58 },
                { header: '', key: '', width: columnWidths[5] + 0.58 },
                { header: '', key: '', width: columnWidths[6] + 0.58 },
                { header: '', key: '', width: columnWidths[7] + 0.58 },
                { header: '', key: '', width: columnWidths[8] + 0.58 },
                { header: '', key: '', width: columnWidths[9] + 0.58 },
            ]
            if (rowCount + 2 > 38) {
                worksheet.mergeCells("A1:J1")
                worksheet.mergeCells("B59:J59")
                worksheet.mergeCells("A17:A18")
                worksheet.mergeCells("C17:C18")
                worksheet.mergeCells("E17:F17")
                worksheet.mergeCells("E18:F18")
                worksheet.mergeCells("G17:H17")
                worksheet.mergeCells("G18:H18")
                worksheet.mergeCells("I17:J17")
                worksheet.mergeCells("I18:J18")
                worksheet.getRow(1).height = 36.75;
                for (let i = 2; i < 18; i++) {
                    worksheet.getRow(i).height = 14.25
                }
                for (let i = 18; i < 59; i++) {
                    worksheet.getRow(i).height = 12
                    worksheet.getCell(`A${i}`).alignment = { horizontal: 'left', vertical: 'middle' }
                    worksheet.getCell(`A${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`B${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
                    worksheet.getCell(`B${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`C${i}`).alignment = { horizontal: 'left', vertical: 'middle' }
                    worksheet.getCell(`C${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`D${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`D${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`E${i}`).style = { numFmt: '#,###' }
                    worksheet.getCell(`E${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`E${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`F${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
                    worksheet.getCell(`F${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`G${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`G${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`H${i}`).style = { numFmt: '#,###.0' }
                    worksheet.getCell(`H${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`H${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`I${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`I${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`J${i}`).style = { numFmt: '0.000' }
                    worksheet.getCell(`J${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`J${i}`).font = { name: 'arial', size: 9 }
                }
                worksheet.getRow(59).height = 46.5

                styleTitleCell(worksheet.getCell('A1'))
                worksheet.getCell('A1').value = {
                    richText: [{ font: { name: 'Arial Black', size: 20, bold: true }, text: title[0], }],
                };

                for (let i = 1; i < 10; i++) {
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${17}`).border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${18}`).border = {
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                }
                for (let i = 1; i < 4; i++) {
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${5}`).border = { bottom: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${9}`).border = { bottom: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${12}`).border = { bottom: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${15}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${17}`).alignment = { horizontal: 'center', vertical: 'middle' }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${18}`).alignment = { horizontal: 'center', vertical: 'middle' }
                }
                for (let i = 4; i < 11; i++) {
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${5}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${8}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${12}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${17}`).alignment = { horizontal: 'center' }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${18}`).alignment = { horizontal: 'center' }

                }
                for (let i = 2; i < 59; i++) {
                    worksheet.getCell(`A${i}`).border = { left: { style: 'thick' } }
                    if (i === 5 || i === 9 || i === 12 || i === 14 || i === 16 || i === 18) {
                        worksheet.getCell(`A${i}`).border = { bottom: { style: 'thin' }, left: { style: 'thick' } }
                    }
                    worksheet.getCell(`J${i}`).border = { right: { style: 'thick' } }
                    if (i === 4 || i === 7 || i === 11 || i === 16 || i === 18) {
                        worksheet.getCell(`J${i}`).border = {
                            right: { style: 'thick' }, bottom: { style: 'thin' }
                        }
                    }
                }

                for (let i = 13; i < 59; i++) {
                    worksheet.getCell(`B${i}`).border = { left: { style: 'thin' } }
                    if (i === 14 || i === 16 || i === 18) {
                        worksheet.getCell(`${String.fromCharCode(66)}${i}`).border = { bottom: { style: 'thin' }, left: { style: 'thin' } }
                    }
                }
                for (let i = 2; i < 59; i++) {
                    worksheet.getCell(`C${i}`).border = { right: { style: 'thin' } }
                    if (i === 5 || i === 9 || i === 12 || i === 14 || i === 16 || i === 18) {
                        worksheet.getCell(`C${i}`).border = { right: { style: 'thin' }, bottom: { style: 'thin' } }
                    }
                }
                for (let i = 17; i < 59; i++) {
                    worksheet.getCell(`B${i}`).border = { right: { style: 'thin' }, left: { style: 'thin' } }
                    worksheet.getCell(`C${i}`).border = { right: { style: 'thin' } }
                    if (i === 17) {
                        worksheet.getCell(`I${i}`).border = { top: { style: 'thin' }, right: { style: 'thick' } }
                    }
                    if (i === 18) {
                        worksheet.getCell(`B${i}`).border = { bottom: { style: 'thin' }, right: { style: 'thin' }, left: { style: 'thin' } }
                    }
                }
                for (let i = 19; i < 59; i++) {
                    worksheet.getCell(`B${i}`).border = { right: { style: 'thin' }, left: { style: 'thin' } }
                    worksheet.getCell(`D${i}`).border = { right: { style: 'thin' } }
                    worksheet.getCell(`F${i}`).border = { left: { style: 'dotted' }, right: { style: 'thin' } }
                    worksheet.getCell(`H${i}`).border = { left: { style: 'dotted' }, right: { style: 'thin' } }
                    worksheet.getCell(`J${i}`).border = { left: { style: 'dotted' }, right: { style: 'thick' } }
                }
                worksheet.getCell('A1').border = {
                    top: { style: "thick" },
                    bottom: { style: "thin" },
                    right: { style: "thick" },
                    left: { style: "thick" },
                };
                worksheet.getCell('B59').border = {
                    top: { style: "thin" },
                    right: { style: 'thick' },

                    bottom: { style: "thick" },
                    left: { style: "thin" },
                };
                worksheet.getCell('A59').border = {
                    bottom: { style: "thick" },
                    left: { style: "thick" },
                };

                worksheet.getCell('A2').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[0] }] }//1. Shipper/Exporter
                worksheet.getCell('A3').alignment = { indent: 1 }
                worksheet.getCell('A3').value = {
                    richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: description[1].shipper },
                    { font: { name: 'Arial', size: 9, bold: false }, text: description[1].tel }]
                }

                worksheet.getCell('A4').alignment = { indent: 1 }
                worksheet.getCell('A4').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[1].address1 }] }
                worksheet.getCell('A5').alignment = { indent: 1 }
                worksheet.getCell('A5').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[1].address2 }] }

                worksheet.getCell('A6').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[1] }] }//2. Consignee
                worksheet.getCell('A7').alignment = { indent: 1 }
                worksheet.getCell('A7').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: description[2].Consignee }] }
                worksheet.getCell('A8').alignment = { indent: 1 }
                worksheet.getCell('A8').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[2].address1 }] }
                worksheet.getCell('A9').alignment = { indent: 1 }
                worksheet.getCell('A9').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[2].address2 }] }

                worksheet.getCell('A10').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[2] }] }//3. Notify Party
                worksheet.getCell('A11').alignment = { indent: 1 }
                worksheet.getCell('A11').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: description[3].Party }] }
                worksheet.getCell('A12').alignment = { indent: 1 }
                worksheet.getCell('A12').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[3].address1 }] }

                worksheet.getCell('A13').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[3] }] }//4. Port of Loading
                worksheet.getCell('A14').alignment = { indent: 1 }
                worksheet.getCell('A14').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[4].Port[0] }] }

                worksheet.getCell('A15').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[5] }] } //6. Carrier
                worksheet.getCell('A16').alignment = { indent: 1 }
                worksheet.getCell('A16').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[6].Carrier }] }

                worksheet.getCell('B13').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[4] }] }//5. Sailing on or about
                worksheet.getCell('B14').alignment = { indent: 1 }
                worksheet.getCell('B14').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[5].Sailing }] }

                worksheet.getCell('B15').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[6] }] }//7. Final Destination
                worksheet.getCell('B16').alignment = { indent: 1 }
                worksheet.getCell('B16').value = { richText: [{ font: { name: 'Arial', size: 9, }, text: description[7].Destination }] }
                worksheet.getCell('B55').alignment = { horizontal: 'center', vertical: 'middle' }

                worksheet.getCell('B59').alignment = { horizontal: 'left', vertical: 'middle' }
                worksheet.getCell('B59').value = {
                    richText: [{ font: { name: 'Arial', size: 12, bold: true }, text: 'To be continued.' }]
                }
                worksheet.getCell('C78').value = {
                    richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: 'Continued.' }]
                }
                worksheet.getCell('D2').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[7] }] }//8. No. & Date of Invoice
                worksheet.getCell('D3').alignment = { indent: 1 }
                worksheet.getCell('D3').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[8]['NO&Date'] }] }
                worksheet.getCell('J4').alignment = { horizontal: 'center' }
                worksheet.getCell('J4').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: '1 OF 2' }] }

                worksheet.getCell('D5').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[8] }] }//9. Payment Terms and Conditions
                worksheet.getCell('D6').alignment = { indent: 1 }
                worksheet.getCell('D6').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[9].Payment }] }

                worksheet.getCell('D8').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[9] }] }//10. Freight Term
                worksheet.getCell('D9').alignment = { indent: 1 }
                worksheet.getCell('D9').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[10].Term[0] }] }

                worksheet.getCell('D12').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[10] }] }//11. Remarks
                worksheet.getCell('D13').alignment = { indent: 1 }
                worksheet.getCell('D13').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[11].Remarks1 }] }
                worksheet.getCell('D14').alignment = { indent: 1 }
                worksheet.getCell('D14').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[11].Remarks2 }] }
                worksheet.getCell('D15').alignment = { indent: 1 }
                worksheet.getCell('D15').value = { richText: [{ font: { name: 'Arial', size: 9, color: { argb: 'ff0' }, }, text: description[11].Forwarder }] }

                worksheet.getCell('A17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[11] }] }//Mark & No.Pkgs
                worksheet.getCell('B17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[12] }] }//Carton
                worksheet.getCell('B18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[13] }] }//No.
                worksheet.getCell('C17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[14] }] }//Items
                worksheet.getCell('D17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[15] }] }//Qty
                worksheet.getCell('D18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[16] }] }//C/T
                worksheet.getCell('E17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[17] }] }//Quantity
                worksheet.getCell('E18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[18] }] }//(Unit)
                worksheet.getCell('G17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[19] }] }//Weight
                worksheet.getCell('G18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[20] }] }//Net/Gross
                worksheet.getCell('I17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[21] }] }//Volume(CBM)
                worksheet.getCell('I18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[22] }] }//Net/Gross



                //===================================================================================================================================================

                worksheet.mergeCells("A60:J60")
                worksheet.mergeCells("A116:J116")
                worksheet.mergeCells("A76:A77")
                worksheet.mergeCells("B114:C115")
                worksheet.mergeCells("C76:C77")
                worksheet.mergeCells("D114:E114")
                worksheet.mergeCells("D115:E115")
                worksheet.mergeCells("G114:H115")
                worksheet.mergeCells("I114:J115")
                worksheet.mergeCells("E76:F76")
                worksheet.mergeCells("E77:F77")
                worksheet.mergeCells("G76:H76")
                worksheet.mergeCells("G77:H77")
                worksheet.mergeCells("I76:J76")
                worksheet.mergeCells("I77:J77")

                worksheet.getRow(60).height = 36.75;
                for (let i = 61; i < 78; i++) {
                    worksheet.getRow(i).height = 14.25
                }
                for (let i = 78; i < 114; i++) {
                    worksheet.getRow(i).height = 12
                    worksheet.getCell(`A${i}`).alignment = { horizontal: 'left', vertical: 'middle' }
                    worksheet.getCell(`A${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`B${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
                    worksheet.getCell(`B${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`C${i}`).alignment = { horizontal: 'left', vertical: 'middle' }
                    worksheet.getCell(`C${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`D${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`D${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`E${i}`).style = { numFmt: '#,###' }
                    worksheet.getCell(`E${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`E${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`F${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
                    worksheet.getCell(`F${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`G${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`G${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`H${i}`).style = { numFmt: '#,###.0' }
                    worksheet.getCell(`H${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`H${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`I${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`I${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`J${i}`).style = { numFmt: '0.000' }
                    worksheet.getCell(`J${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`J${i}`).font = { name: 'arial', size: 9 }
                }
                worksheet.getRow(116).height = 69

                styleTitleCell(worksheet.getCell('A60'))
                worksheet.getCell('A60').value = {
                    richText: [{ font: { name: 'Arial Black', size: 20, bold: true }, text: title[0], }],
                };

                for (let i = 1; i < 10; i++) {
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${76}`).border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${77}`).border = {
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                }
                for (let i = 1; i < 4; i++) {
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${64}`).border = { bottom: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${68}`).border = { bottom: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${71}`).border = { bottom: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${74}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${76}`).alignment = { horizontal: 'center', vertical: 'middle' }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${77}`).alignment = { horizontal: 'center', vertical: 'middle' }
                }
                for (let i = 4; i < 11; i++) {
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${64}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${67}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${71}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${76}`).alignment = { horizontal: 'center' }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${77}`).alignment = { horizontal: 'center' }

                }
                for (let i = 61; i < 116; i++) {
                    worksheet.getCell(`A${i}`).border = { left: { style: 'thick' } }
                    if (i === 64 || i === 68 || i === 71 || i === 73 || i === 75 || i === 77) {
                        worksheet.getCell(`A${i}`).border = { bottom: { style: 'thin' }, left: { style: 'thick' } }
                    }
                    worksheet.getCell(`J${i}`).border = { right: { style: 'thick' } }
                    if (i === 63 || i === 66 || i === 70 || i === 75 || i === 77) {
                        worksheet.getCell(`J${i}`).border = {
                            right: { style: 'thick' }, bottom: { style: 'thin' }
                        }
                    }
                }

                for (let i = 72; i < 116; i++) {
                    worksheet.getCell(`B${i}`).border = { left: { style: 'thin' } }
                    if (i === 73 || i === 75 || i === 77) {
                        worksheet.getCell(`B${i}`).border = { bottom: { style: 'thin' }, left: { style: 'thin' } }
                    }
                }
                for (let i = 61; i < 116; i++) {
                    worksheet.getCell(`C${i}`).border = { right: { style: 'thin' } }
                    if (i === 64 || i === 68 || i === 71 || i === 73 || i === 75 || i === 77) {
                        worksheet.getCell(`C${i}`).border = { right: { style: 'thin' }, bottom: { style: 'thin' } }
                    }
                }
                for (let i = 76; i < 116; i++) {
                    worksheet.getCell(`B${i}`).border = { right: { style: 'thin' }, left: { style: 'thin' } }
                    if (i === 76) {
                        worksheet.getCell(`I${i}`).border = { top: { style: 'thin' }, right: { style: 'thick' } }
                    }
                    if (i === 77) {
                        worksheet.getCell(`B${i}`).border = { bottom: { style: 'thin' }, right: { style: 'thin' }, left: { style: 'thin' } }
                    }
                }
                for (let i = 78; i < 116; i++) {
                    worksheet.getCell(`B${i}`).border = { right: { style: 'thin' }, left: { style: 'thin' } }
                    worksheet.getCell(`D${i}`).border = { right: { style: 'thin' } }
                    worksheet.getCell(`F${i}`).border = { left: { style: 'dotted' }, right: { style: 'thin' } }
                    worksheet.getCell(`H${i}`).border = { left: { style: 'dotted' }, right: { style: 'thin' } }
                    worksheet.getCell(`J${i}`).border = { left: { style: 'dotted' }, right: { style: 'thick' } }
                }
                worksheet.getCell('A60').border = {
                    top: { style: "thick" },
                    bottom: { style: "thin" },
                    right: { style: "thick" },
                    left: { style: "thick" },
                };
                worksheet.getCell('B114').border = {
                    top: { style: "thin" },
                    right: { style: 'thin' },
                    left: { style: "thin" },
                };
                worksheet.getCell('D114').border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                };
                worksheet.getCell('E114').border = {
                    top: { style: "thin" },
                    right: { style: "thin" },
                };
                worksheet.getCell('F114').border = {
                    top: { style: "thin" },
                    right: { style: "thin" },
                    left: { style: 'thin' }
                };
                worksheet.getCell('G114').border = {
                    top: { style: "thin" },
                    right: { style: "thin" },
                };
                worksheet.getCell('H114').border = {
                    top: { style: "thin" },
                    right: { style: "thin" },
                };
                worksheet.getCell('I114').border = {
                    top: { style: "thin" },
                    right: { style: "thin" },
                };
                worksheet.getCell('J114').border = {
                    top: { style: "thin" },
                    right: { style: "thick" },
                };
                worksheet.getCell('B116').border = {
                    top: { style: "thin" },
                    right: { style: 'thick' },
                    bottom: { style: "thick" },
                    left: { style: "thick" },
                };
                // worksheet.getCell('A116').border = {
                //     bottom: { style: "thick" },
                //     left: { style: "thick" },
                // };

                worksheet.getCell('A61').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[0] }] }//1. Shipper/Exporter
                worksheet.getCell('A62').alignment = { indent: 1 }
                worksheet.getCell('A62').value = {
                    richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: description[1].shipper },
                    { font: { name: 'Arial', size: 9, bold: false }, text: description[1].tel }]
                }

                worksheet.getCell('A63').alignment = { indent: 1 }
                worksheet.getCell('A63').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[1].address1 }] }
                worksheet.getCell('A64').alignment = { indent: 1 }
                worksheet.getCell('A64').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[1].address2 }] }

                worksheet.getCell('A65').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[1] }] }//2. Consignee
                worksheet.getCell('A66').alignment = { indent: 1 }
                worksheet.getCell('A66').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: description[2].Consignee }] }
                worksheet.getCell('A67').alignment = { indent: 1 }
                worksheet.getCell('A67').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[2].address1 }] }
                worksheet.getCell('A68').alignment = { indent: 1 }
                worksheet.getCell('A68').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[2].address2 }] }

                worksheet.getCell('A69').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[2] }] }//3. Notify Party
                worksheet.getCell('A70').alignment = { indent: 1 }
                worksheet.getCell('A70').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: description[3].Party }] }
                worksheet.getCell('A71').alignment = { indent: 1 }
                worksheet.getCell('A71').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[3].address1 }] }

                worksheet.getCell('A72').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[3] }] }//4. Port of Loading
                worksheet.getCell('A73').alignment = { indent: 1 }
                worksheet.getCell('A73').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[4].Port[0] }] }

                worksheet.getCell('A74').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[5] }] } //6. Carrier
                worksheet.getCell('A75').alignment = { indent: 1 }
                worksheet.getCell('A75').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[6].Carrier }] }

                worksheet.getCell('B72').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[4] }] }//5. Sailing on or about
                worksheet.getCell('B73').alignment = { indent: 1 }
                worksheet.getCell('B73').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[5].Sailing }] }

                worksheet.getCell('B74').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[6] }] }//7. Final Destination
                worksheet.getCell('B75').alignment = { indent: 1 }
                worksheet.getCell('B75').value = { richText: [{ font: { name: 'Arial', size: 9, }, text: description[7].Destination }] }
                worksheet.getCell('B114').alignment = { horizontal: 'center', vertical: 'middle' }
                worksheet.getCell('F114').alignment = { horizontal: 'center', vertical: 'middle' }
                worksheet.getCell('F115').alignment = { horizontal: 'center', vertical: 'middle' }

                worksheet.getCell('B116').alignment = { horizontal: 'center', vertical: 'middle' }
                worksheet.getCell('D116').value = {
                    richText: [{ font: { name: 'Arial', size: 12, bold: true }, text: 'Signed by' }]
                }
                worksheet.getCell('D61').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[7] }] }//8. No. & Date of Invoice
                worksheet.getCell('D62').alignment = { indent: 1 }
                worksheet.getCell('D62').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[8]['NO&Date'] }] }
                worksheet.getCell('J63').alignment = { horizontal: 'center' }
                worksheet.getCell('J63').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: '2 OF 2' }] }

                worksheet.getCell('D64').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[8] }] }//9. Payment Terms and Conditions
                worksheet.getCell('D65').alignment = { indent: 1 }
                worksheet.getCell('D65').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[9].Payment }] }

                worksheet.getCell('D67').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[9] }] }//10. Freight Term
                worksheet.getCell('D68').alignment = { indent: 1 }
                worksheet.getCell('D68').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[10].Term[0] }] }

                worksheet.getCell('D71').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[10] }] }//11. Remarks
                worksheet.getCell('D72').alignment = { indent: 1 }
                worksheet.getCell('D72').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[11].Remarks1 }] }
                worksheet.getCell('D73').alignment = { indent: 1 }
                worksheet.getCell('D73').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[11].Remarks2 }] }
                worksheet.getCell('D74').alignment = { indent: 1 }
                worksheet.getCell('D74').value = { richText: [{ font: { name: 'Arial', size: 9, color: { argb: 'ff0' }, }, text: description[11].Forwarder }] }

                worksheet.getCell('A76').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[11] }] }//Mark & No.Pkgs
                worksheet.getCell('B76').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[12] }] }//Carton
                worksheet.getCell('B77').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[13] }] }//No.
                worksheet.getCell('C76').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[14] }] }//Items
                worksheet.getCell('D76').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[15] }] }//Qty
                worksheet.getCell('D77').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[16] }] }//C/T
                worksheet.getCell('E76').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[17] }] }//Quantity
                worksheet.getCell('E77').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[18] }] }//(Unit)
                worksheet.getCell('G76').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[19] }] }//Weight
                worksheet.getCell('G77').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[20] }] }//Net/Gross
                worksheet.getCell('I76').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[21] }] }//Volume(CBM)
                worksheet.getCell('I77').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[22] }] }//Net/Gross
                worksheet.getCell('B114').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: 'TOTAL' }] }
                worksheet.getCell('F114').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: 'SET' }] }
                worksheet.getCell('F115').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: 'EA' }] }

                let dataLength = 0;
                let extraPage = 0
                if (type === 'CT') {
                    if (packingData) {
                        let totalCT = 0;
                        // eslint-disable-next-line no-loop-func
                        packingData.forEach((item, index) => {
                            if (index + 19 > 58) {
                                extraPage = 20
                            }
                            if (index) {
                                if (totalCT + 1 <= item.CT_qty + totalCT) {
                                    worksheet.getCell(`B${index + 19 + extraPage}`).value = `${totalCT + 1} - ${item.CT_qty + totalCT}`
                                } else {
                                    worksheet.getCell(`B${index + 19 + extraPage}`).value = `${totalCT + 1} -`
                                }
                            } else {
                                worksheet.getCell(`B${index + 19 + extraPage}`).value = `1 - ${item.CT_qty}`
                            }
                            worksheet.getCell(`C${index + 19 + extraPage}`).value = item.itemName
                            worksheet.getCell(`D${index + 19 + extraPage}`).value = item.CT_qty
                            worksheet.getCell(`E${index + 19 + extraPage}`).value = item.quantity
                            worksheet.getCell(`F${index + 19 + extraPage}`).value = item.sets
                            worksheet.getCell(`G${index + 19 + extraPage}`).value = item.weight
                            worksheet.getCell(`H${index + 19 + extraPage}`).value = item.weight * item.CT_qty
                            worksheet.getCell(`I${index + 19 + extraPage}`).value = item.cbm
                            worksheet.getCell(`J${index + 19 + extraPage}`).value = item.cbm * item.CT_qty
                            totalCT += item.CT_qty
                        })
                        dataLength = packingData.length + extraPage
                    }
                } else {
                    let rowData = 0
                    for (let i = 0; i < 10; i++) {
                        // eslint-disable-next-line no-loop-func
                        palletData[i].forEach((item, index) => {
                            if (rowData + 19 > 58) {
                                extraPage = 20

                            }
                            if (!index) {

                                worksheet.getCell(`B${19 + rowData + extraPage}`).alignment = { vertical: 'top', horizontal: 'centerContinuous' }
                                worksheet.getCell(`B${19 + rowData + extraPage}`).value = `${i + 1}      ${palletData[i].reduce((acc, curr) => {
                                    acc += curr.CT_qty
                                    return acc
                                }, 0)}`

                                worksheet.getCell(`H${19 + rowData + extraPage}`).value = palletData[i].reduce((acc, curr) => {
                                    acc += curr.weight * curr.CT_qty
                                    return acc
                                }, 0) + 9

                                worksheet.getCell(`J${19 + rowData + extraPage} `).value = palletData[i].reduce((acc, curr) => {
                                    acc += curr.cbm * curr.CT_qty
                                    return acc
                                }, 0)
                            }
                            worksheet.getCell(`C${19 + rowData + extraPage}`).value = item.item
                            worksheet.getCell(`D${19 + rowData + extraPage}`).value = item.CT_qty
                            worksheet.getCell(`E${19 + rowData + extraPage}`).value = item.CT_qty * item.moq
                            worksheet.getCell(`F${19 + rowData + extraPage}`).value = item.sets
                            worksheet.getCell(`G${19 + rowData + extraPage}`).value = item.weight
                            worksheet.getCell(`I${19 + rowData + extraPage}`).value = item.cbm

                            rowData += 1
                        })
                        dataLength = rowData + extraPage
                    }
                }
                for (let i = 2; i < 11; i++) {
                    if (i === 2) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18}`).border = {
                            left: { style: 'thin' }, bottom: { style: 'double', color: { argb: 'ff0000' } }, right: { style: 'thin' }
                        }
                    }
                    if (i === 3) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18}`).border = {
                            left: { style: 'dotted' }, right: { style: 'thin' }, bottom: { style: 'double', color: { argb: 'ff0000' } }
                        }
                    }
                    if (i === 4) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18}`).border = {
                            left: { style: 'dotted' }, right: { style: 'thin' }, bottom: { style: 'double', color: { argb: 'ff0000' } }
                        }
                    }
                    if (i === 5) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18}`).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } }
                        }
                    }
                    if (i === 6) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18}`).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } }, left: { style: 'dotted' }, right: { style: 'thin' }
                        }
                    }
                    if (i === 7) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18}`).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } },
                        }
                    }
                    if (i === 8) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18}`).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } },
                        }
                    }
                    if (i === 9) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18}`).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } }, left: { style: 'thin' }, right: { style: 'dotted' }
                        }
                    }
                    if (i === 10) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18}`).border = {
                            right: { style: 'thick' }, bottom: { style: 'double', color: { argb: 'ff0000' } },
                        }
                    }
                }




                const image_sign = './images/sign.png'
                const response_sign = await fetch(image_sign)
                const buffer_sign = await response_sign.arrayBuffer();
                const imageSign = workbook.addImage({
                    buffer: buffer_sign,
                    extension: 'png',
                });

                worksheet.addImage(imageSign, {
                    tl: { col: 4, row: 115.3 }, ext: { width: 270, height: 40 }, editAs: 'absolute'
                });


                const image_logo = './images/dtlogo.png'
                const response_logo = await fetch(image_logo)
                const buffer_logo = await response_logo.arrayBuffer();
                const imageDiamond = workbook.addImage({
                    buffer: buffer_logo,
                    extension: 'png',
                });
                worksheet.addImage(imageDiamond, {
                    tl: { col: 0.5, row: 19 }, ext: { width: 150, height: 80 }, editAs: 'absolute'
                });
                worksheet.addImage(imageDiamond, {
                    tl: { col: 0.5, row: 78 }, ext: { width: 150, height: 80 }, editAs: 'absolute'
                });

                const imageEK_logo = './images/ek_logo.png';
                const response = await fetch(imageEK_logo);
                const buffer = await response.arrayBuffer()
                const EK_logoImageId3 = workbook.addImage({
                    buffer: buffer,
                    extension: 'png',
                });
                worksheet.addImage(EK_logoImageId3, {
                    tl: { col: 0.5, row: 0.1 }, ext: { width: 135, height: 42 }, editAs: 'absolute'
                });
                worksheet.addImage(EK_logoImageId3, {
                    tl: { col: 0.5, row: 59.1 }, ext: { width: 135, height: 42 }, editAs: 'absolute'
                });
            } else {
                worksheet.mergeCells("A1:J1")
                worksheet.mergeCells("A57:J57")
                worksheet.mergeCells("B55:C56")
                worksheet.mergeCells("D55:E55")
                worksheet.mergeCells("D56:E56")
                worksheet.mergeCells("A17:A18")
                worksheet.mergeCells("C17:C18")
                worksheet.mergeCells("E17:F17")
                worksheet.mergeCells("E18:F18")
                worksheet.mergeCells("G17:H17")
                worksheet.mergeCells("G55:H56")
                worksheet.mergeCells("G18:H18")
                worksheet.mergeCells("I17:J17")
                worksheet.mergeCells("I18:J18")
                worksheet.mergeCells("I55:J56")

                worksheet.getRow(1).height = 36.75;
                for (let i = 2; i < 18; i++) {
                    worksheet.getRow(i).height = 14.25
                }
                for (let i = 18; i < 57; i++) {
                    worksheet.getRow(i).height = 12

                    worksheet.getCell(`A${i}`).alignment = { horizontal: 'left', vertical: 'middle' }
                    worksheet.getCell(`A${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`B${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
                    worksheet.getCell(`B${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`C${i}`).alignment = { horizontal: 'left', vertical: 'middle' }
                    worksheet.getCell(`C${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`D${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`D${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`E${i}`).style = { numFmt: '#,###' }
                    worksheet.getCell(`E${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`E${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`F${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
                    worksheet.getCell(`F${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`G${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`G${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`H${i}`).style = { numFmt: '#,###.0' }
                    worksheet.getCell(`H${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`H${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`I${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`I${i}`).font = { name: 'arial', size: 9 }
                    worksheet.getCell(`J${i}`).style = { numFmt: '0.000' }
                    worksheet.getCell(`J${i}`).alignment = { horizontal: 'right', vertical: 'middle' }
                    worksheet.getCell(`J${i}`).font = { name: 'arial', size: 9 }
                }
                worksheet.getRow(57).height = 69

                styleTitleCell(worksheet.getCell('A1'))
                worksheet.getCell('A1').value = {
                    richText: [{ font: { name: 'Arial Black', size: 20, bold: true }, text: title[0], }],
                };

                for (let i = 1; i < 10; i++) {
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${17}`).border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${18}`).border = {
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                }
                for (let i = 1; i < 4; i++) {
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${5}`).border = { bottom: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${9}`).border = { bottom: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${12}`).border = { bottom: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${15}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${17}`).alignment = { horizontal: 'center', vertical: 'middle' }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${18}`).alignment = { horizontal: 'center', vertical: 'middle' }
                }
                for (let i = 4; i < 11; i++) {
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${5}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${8}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${12}`).border = { top: { style: 'thin' } }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${17}`).alignment = { horizontal: 'center' }
                    worksheet.getCell(`${String.fromCharCode(i + 64)}${18}`).alignment = { horizontal: 'center' }

                }
                for (let i = 2; i < 57; i++) {
                    worksheet.getCell(`A${i}`).border = { left: { style: 'thick' } }
                    if (i === 5 || i === 9 || i === 12 || i === 14 || i === 16 || i === 18) {
                        worksheet.getCell(`A${i}`).border = { bottom: { style: 'thin' }, left: { style: 'thick' } }
                    }
                    worksheet.getCell(`J${i}`).border = { right: { style: 'thick' } }
                    if (i === 4 || i === 7 || i === 11 || i === 16 || i === 18) {
                        worksheet.getCell(`J${i}`).border = {
                            right: { style: 'thick' }, bottom: { style: 'thin' }
                        }
                    }
                }

                for (let i = 13; i < 57; i++) {
                    worksheet.getCell(`B${i}`).border = { left: { style: 'thin' } }
                    if (i === 14 || i === 16 || i === 18) {
                        worksheet.getCell(`${String.fromCharCode(66)}${i}`).border = { bottom: { style: 'thin' }, left: { style: 'thin' } }
                    }
                }
                for (let i = 2; i < 55; i++) {
                    worksheet.getCell(`C${i}`).border = { right: { style: 'thin' } }
                    if (i === 5 || i === 9 || i === 12 || i === 14 || i === 16 || i === 18) {
                        worksheet.getCell(`C${i}`).border = { right: { style: 'thin' }, bottom: { style: 'thin' } }
                    }
                }
                for (let i = 17; i < 55; i++) {
                    worksheet.getCell(`B${i}`).border = { right: { style: 'thin' }, left: { style: 'thin' } }
                    if (i === 17) {
                        worksheet.getCell(`I${i}`).border = { top: { style: 'thin' }, right: { style: 'thick' } }
                    }
                    if (i === 18) {
                        worksheet.getCell(`B${i}`).border = { bottom: { style: 'thin' }, right: { style: 'thin' }, left: { style: 'thin' } }
                    }
                }
                for (let i = 19; i < 55; i++) {
                    worksheet.getCell(`B${i}`).border = { right: { style: 'thin' }, left: { style: 'thin' } }
                    worksheet.getCell(`D${i}`).border = { right: { style: 'thin' } }
                    worksheet.getCell(`F${i}`).border = { left: { style: 'dotted' }, right: { style: 'thin' } }
                    worksheet.getCell(`H${i}`).border = { left: { style: 'dotted' }, right: { style: 'thin' } }
                    worksheet.getCell(`J${i}`).border = { left: { style: 'dotted' }, right: { style: 'thick' } }
                }
                worksheet.getCell('A1').border = {
                    top: { style: "thick" },
                    bottom: { style: "thin" },
                    right: { style: "thick" },
                    left: { style: "thick" },
                };
                worksheet.getCell('B55').border = {
                    top: { style: "thin" },
                    right: { style: 'thin' },
                    left: { style: 'thin' },
                };
                worksheet.getCell('D55').border = {
                    top: { style: "thin" },
                    right: { style: 'thin' },
                    left: { style: 'thin' },
                };
                worksheet.getCell('E55').border = {
                    top: { style: "thin" },
                    right: { style: 'thin' },

                };
                worksheet.getCell('F55').border = {
                    top: { style: "thin" },
                    right: { style: 'thin' },
                    left: { style: 'thin' },
                };
                worksheet.getCell('F56').border = {

                    right: { style: 'thin' },
                    left: { style: 'thin' },
                };
                worksheet.getCell('G55').border = {
                    top: { style: "thin" },
                    left: { style: 'thin' },
                };
                worksheet.getCell('H55').border = {
                    top: { style: "thin" },
                    right: { style: 'thin' },

                };
                worksheet.getCell('I55').border = {
                    top: { style: "thin" },
                    left: { style: 'thin' },
                };
                worksheet.getCell('J55').border = {
                    top: { style: "thin" },
                    right: { style: 'thick' },

                };

                worksheet.getCell('B57').border = {
                    top: { style: "thin" },
                    right: { style: 'thick' },

                    bottom: { style: "thick" },
                    left: { style: "thick" },
                };


                worksheet.getCell('A2').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[0] }] }//1. Shipper/Exporter
                worksheet.getCell('A3').alignment = { indent: 1 }
                worksheet.getCell('A3').value = {
                    richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: description[1].shipper },
                    { font: { name: 'Arial', size: 9, bold: false }, text: description[1].tel }]
                }

                worksheet.getCell('A4').alignment = { indent: 1 }
                worksheet.getCell('A4').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[1].address1 }] }
                worksheet.getCell('A5').alignment = { indent: 1 }
                worksheet.getCell('A5').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[1].address2 }] }

                worksheet.getCell('A6').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[1] }] }//2. Consignee
                worksheet.getCell('A7').alignment = { indent: 1 }
                worksheet.getCell('A7').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: description[2].Consignee }] }
                worksheet.getCell('A8').alignment = { indent: 1 }
                worksheet.getCell('A8').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[2].address1 }] }
                worksheet.getCell('A9').alignment = { indent: 1 }
                worksheet.getCell('A9').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[2].address2 }] }

                worksheet.getCell('A10').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[2] }] }//3. Notify Party
                worksheet.getCell('A11').alignment = { indent: 1 }
                worksheet.getCell('A11').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: description[3].Party }] }
                worksheet.getCell('A12').alignment = { indent: 1 }
                worksheet.getCell('A12').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[3].address1 }] }

                worksheet.getCell('A13').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[3] }] }//4. Port of Loading
                worksheet.getCell('A14').alignment = { indent: 1 }
                worksheet.getCell('A14').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[4].Port[0] }] }

                worksheet.getCell('A15').value = { richText: [{ font: { name: 'Arial', bold: true, size: 9 }, text: headers[5] }] } //6. Carrier
                worksheet.getCell('A16').alignment = { indent: 1 }
                worksheet.getCell('A16').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[6].Carrier }] }

                worksheet.getCell('B13').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[4] }] }//5. Sailing on or about
                worksheet.getCell('B14').alignment = { indent: 1 }
                worksheet.getCell('B14').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[5].Sailing }] }

                worksheet.getCell('B15').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[6] }] }//7. Final Destination
                worksheet.getCell('B16').alignment = { indent: 1 }
                worksheet.getCell('B16').value = { richText: [{ font: { name: 'Arial', size: 9, }, text: description[7].Destination }] }
                worksheet.getCell('B55').alignment = { horizontal: 'center', vertical: 'middle' }

                worksheet.getCell('B57').alignment = { horizontal: 'center', vertical: 'middle' }
                worksheet.getCell('B57').value = {
                    richText: [{ font: { name: 'Arial', size: 12, bold: true }, text: 'Signed by' }]
                }
                worksheet.getCell('D2').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[7] }] }//8. No. & Date of Invoice
                worksheet.getCell('D3').alignment = { indent: 1 }
                worksheet.getCell('D3').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[8]['NO&Date'] }] }
                worksheet.getCell('J4').alignment = { horizontal: 'center' }
                worksheet.getCell('J4').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[8].page1 }] }

                worksheet.getCell('D5').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[8] }] }//9. Payment Terms and Conditions
                worksheet.getCell('D6').alignment = { indent: 1 }
                worksheet.getCell('D6').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[9].Payment }] }

                worksheet.getCell('D8').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[9] }] }//10. Freight Term
                worksheet.getCell('D9').alignment = { indent: 1 }
                worksheet.getCell('D9').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[10].Term[0] }] }

                worksheet.getCell('D12').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[10] }] }//11. Remarks
                worksheet.getCell('D13').alignment = { indent: 1 }
                worksheet.getCell('D13').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[11].Remarks1 }] }
                worksheet.getCell('D14').alignment = { indent: 1 }
                worksheet.getCell('D14').value = { richText: [{ font: { name: 'Arial', size: 9 }, text: description[11].Remarks2 }] }
                worksheet.getCell('D15').alignment = { indent: 1 }
                worksheet.getCell('D15').value = { richText: [{ font: { name: 'Arial', size: 9, color: { argb: 'ff0' }, }, text: description[11].Forwarder }] }

                worksheet.getCell('A17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[11] }] }//Mark & No.Pkgs
                worksheet.getCell('B17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[12] }] }//Carton
                worksheet.getCell('B18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[13] }] }//No.
                worksheet.getCell('C17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[14] }] }//Items
                worksheet.getCell('D17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[15] }] }//Qty
                worksheet.getCell('D18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[16] }] }//C/T
                worksheet.getCell('E17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[17] }] }//Quantity
                worksheet.getCell('E18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[18] }] }//(Unit)
                worksheet.getCell('G17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[19] }] }//Weight
                worksheet.getCell('G18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[20] }] }//Net/Gross
                worksheet.getCell('I17').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[21] }] }//Volume(CBM)
                worksheet.getCell('I18').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: headers[22] }] }//Net/Gross
                worksheet.getCell('B55').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: 'TOTAL' }] }//Net/Gross
                worksheet.getCell('F55').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: 'SET' }] }//Net/Gross
                worksheet.getCell('F56').value = { richText: [{ font: { name: 'Arial', size: 9, bold: true }, text: 'EA' }] }//Net/Gross

                let dataLength = 0;
                if (type === 'CT') {
                    if (packingData) {
                        let totalCT = 0;
                        dataLength = packingData.length
                        // eslint-disable-next-line no-loop-func
                        packingData.forEach((item, index) => {
                            if (index) {
                                if (totalCT + 1 <= item.CT_qty + totalCT) {
                                    worksheet.getCell(`B${index + 19}`).value = `${totalCT + 1} - ${item.CT_qty + totalCT}`
                                } else {
                                    worksheet.getCell(`B${index + 19}`).value = `${totalCT + 1} -`
                                }
                            } else {
                                worksheet.getCell(`B${index + 19}`).value = `1 - ${item.CT_qty}`
                            }

                            worksheet.getCell(`C${index + 19}`).value = item.itemName
                            worksheet.getCell(`D${index + 19}`).value = item.CT_qty
                            worksheet.getCell(`E${index + 19}`).value = item.quantity
                            worksheet.getCell(`F${index + 19}`).value = item.sets
                            worksheet.getCell(`G${index + 19}`).value = item.weight
                            worksheet.getCell(`H${index + 19}`).value = item.weight * item.CT_qty
                            worksheet.getCell(`I${index + 19}`).value = item.cbm
                            worksheet.getCell(`J${index + 19}`).value = item.cbm * item.CT_qty
                            totalCT += item.CT_qty
                        })
                    }
                } else {
                    let lowData = 0;
                    for (let i = 0; i < 10; i++) {
                        // eslint-disable-next-line no-loop-func
                        palletData[i].forEach((item, index) => {
                            if (!index) {
                                worksheet.getCell(`B${19 + lowData}`).alignment = { vertical: 'top', horizontal: 'centerContinuous' }
                                worksheet.getCell(`B${19 + lowData}`).value = `${i + 1}      ${palletData[i].reduce((acc, curr) => {
                                    acc += curr.CT_qty
                                    return acc
                                }, 0)}`

                                worksheet.getCell(`H${19 + lowData}`).value = palletData[i].reduce((acc, curr) => {
                                    acc += curr.weight * curr.CT_qty
                                    return acc
                                }, 0) + 9

                                worksheet.getCell(`J${19 + lowData} `).value = palletData[i].reduce((acc, curr) => {
                                    acc += curr.cbm * curr.CT_qty
                                    return acc
                                }, 0)
                            }
                            worksheet.getCell(`C${19 + lowData} `).value = item.item
                            worksheet.getCell(`D${19 + lowData} `).value = item.CT_qty
                            worksheet.getCell(`E${19 + lowData} `).value = item.CT_qty * item.moq || item.quantity
                            worksheet.getCell(`F${19 + lowData} `).value = item.sets
                            worksheet.getCell(`G${19 + lowData} `).value = item.weight
                            worksheet.getCell(`I${19 + lowData} `).value = item.cbm
                            lowData += 1
                        })
                    }
                    dataLength = lowData;
                }
                for (let i = 2; i < 11; i++) {
                    if (i === 2) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18} `).border = {
                            left: { style: 'thin' }, bottom: { style: 'double', color: { argb: 'ff0000' } }, right: { style: 'thin' }
                        }
                    }
                    if (i === 3) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18} `).border = {
                            left: { style: 'dotted' }, right: { style: 'thin' }, bottom: { style: 'double', color: { argb: 'ff0000' } }
                        }
                    }
                    if (i === 4) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18} `).border = {
                            left: { style: 'dotted' }, right: { style: 'thin' }, bottom: { style: 'double', color: { argb: 'ff0000' } }
                        }
                    }
                    if (i === 5) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18} `).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } }
                        }
                    }
                    if (i === 6) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18} `).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } }, left: { style: 'dotted' }, right: { style: 'thin' }
                        }
                    }
                    if (i === 7) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18} `).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } },
                        }
                    }
                    if (i === 8) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18} `).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } },
                        }
                    }
                    if (i === 9) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18} `).border = {
                            bottom: { style: 'double', color: { argb: 'ff0000' } }, left: { style: 'thin' }, right: { style: 'dotted' }
                        }
                    }
                    if (i === 10) {
                        worksheet.getCell(`${String.fromCharCode(i + 64)}${dataLength + 18} `).border = {
                            right: { style: 'thick' }, bottom: { style: 'double', color: { argb: 'ff0000' } },
                        }
                    }
                }

                const image_sign = './images/sign.png'
                const response_sign = await fetch(image_sign)
                const buffer_sign = await response_sign.arrayBuffer();
                const imageSign = workbook.addImage({
                    buffer: buffer_sign,
                    extension: 'png',
                });

                worksheet.addImage(imageSign, {
                    tl: { col: 4, row: 56.3 }, ext: { width: 270, height: 40 }, editAs: 'absolute'
                });


                const image_logo = './images/dtlogo.png'
                const response_logo = await fetch(image_logo)
                const buffer_logo = await response_logo.arrayBuffer();
                const imageDiamond = workbook.addImage({
                    buffer: buffer_logo,
                    extension: 'png',
                });
                worksheet.addImage(imageDiamond, {
                    tl: { col: 0.5, row: 19 }, ext: { width: 150, height: 80 }, editAs: 'absolute'
                });


                const imageEK_logo = './images/ek_logo.png';
                const response = await fetch(imageEK_logo);
                const buffer = await response.arrayBuffer()
                const EK_logoImageId3 = workbook.addImage({
                    buffer: buffer,
                    extension: 'png',
                });
                worksheet.addImage(EK_logoImageId3, {
                    tl: { col: 0.5, row: 0.1 }, ext: { width: 135, height: 42 }, editAs: 'absolute'
                });

            }
            const fileData = await workbook.xlsx.writeBuffer();
            const blob = new Blob([fileData], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
            if (type === 'CT') {
                saveAs(blob, 'C/T_PACKING')
            } else {
                saveAs(blob, 'P/T_PACKING')

            }
        } catch (e) {
            console.error(e);
            throw e;
        }
};