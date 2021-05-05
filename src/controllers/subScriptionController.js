const pdf = require('pdf-creator-node');
const fs = require('fs');

exports.downloadInvoice = async (req, res) => {
  console.log('got here');
  console.log(req.params.userId);

  const html = `<!DOCTYPE html>
<html>
    <head>
        <mate charest="utf-8" />
        <title>Hello world!</title>
    </head>
    <body>
        <h1>User List</h1>
        <ul>
            {{#each users}}
            <li>Name: {{this.name}}</li>
            <li>Age: {{this.age}}</li>
            <br>
        {{/each}}
        </ul>
    </body>
</html>`;

  const users = [
    {
      name: 'Shyam',
      age: '26',
    },
    {
      name: 'Navjot',
      age: '26',
    },
    {
      name: 'Vitthal',
      age: '26',
    },
  ];
  const document = {
    html,
    data: {
      users,
    },
    path: './output.pdf',
  };

  const options = {
    format: 'A3',
    orientation: 'portrait',
    border: '10mm',
    header: {
      height: '45mm',
      contents: '<div style="text-align: center;">Author: Shyam Hajare</div>',
    },
    footer: {
      height: '28mm',
      contents: {
        first: 'Cover page',
        2: 'Second page', // Any page number is working. 1-based index
        default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
        last: 'Last Page',
      },
    },
  };
  const file = await pdf.create(document, options);

  file.write(`${'test'}.pdf`, res);
};
