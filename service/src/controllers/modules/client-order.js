const request = require('request');
const store = require('store');
const { client } = require('../../server');

const orderClienteUser = async (msg) => {
  const nomeDatabase = await store.get('@database_nome');
  store.set('@input_purchase_code', msg.body);
  const cnpj = await store.get('@input_cnpj');
  const purchaseCode = await store.get('@input_purchase_code');

  switch (true) {
    case purchaseCode.length == '' || isNaN(cnpj):
      client.sendMessage(
        msg.from,
        `*${nomeDatabase}*Type only *numbers* without dashes or periods. 😅`
      );
      break;
    case purchaseCode.length > 0:
      request(
        `http://localhost:4001/api/order-user/${cnpj}/${purchaseCode}`,
        async (error, result) => {
          if (error || result.statusCode !== 200)
            return msg.reply(`😥 ${purchaseCode} *${result.body}*`);

          const res = JSON.parse(result.body);
          const {
            purchase_code,
            product_name,
            product_price,
            units,
            tracking_code,
            delivery_address,
            fiscal_note_pdf_64,
          } = res[0];

          if (tracking_code == '' || fiscal_note_pdf_64 == '') {
            return 'In analysis!';
          }

          msg.reply(
            `Hi *${nomeDatabase}* Here is all the details of your order` +
              `\n*Purchase Code*: ${purchase_code}` +
              `\n*Product Name*: ${product_name}` +
              `\n*Product Price*: ${purchase_code}` +
              `\n*Product Name*: ${product_price}` +
              `\n*Units*: ${units}` +
              `\n*Tracking Code*: ${tracking_code}` +
              `\n*Delivery Address*: ${delivery_address}`
          );

          client.sendMessage(
            msg.from,
            '*WANT MORE INFORMATION?*' +
              '\n\n*1* - Consult new order' +
              '\n*2* - Consult Registration Details' +
              '\n*3* - Download 2 via Nota Fiscal' +
              '\n*0* - Exit'
          );
          client.setPrevMessage('result');
        }
      );
      break;
    default:
      store.clearAll();
      client.sendMessage(
        msg.from,
        'OPSS! 😅 I apologize. but you typed something invalid, type *BACK* if you have any questions'
      );
  }
};

module.exports = {
  orderClienteUser
};
