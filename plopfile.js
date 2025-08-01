const transfromCol = (col) => {
  const _ = require('lodash')
  return _.pick(col, ['title', 'dataIndex', 'width', 'valueEnum', 'valueType'])
}

module.exports = (plop) => {
  const helpers = require('handlebars-helpers')()
  const _ = require('lodash')
  plop.setHelper(helpers)

  plop.setGenerator('page', {
    description: 'Create a page',
    prompts: [
      {
        type: 'input',
        name: 'rootPathName',
        message: 'What is your root path name?',
      },
      {
        type: 'input',
        name: 'pageName',
        message: 'What is your page name?',
      },
      {
        type: 'confirm',
        name: 'hasCreateModelAndService',
        message: 'Do you want create model and service?',
      },
      {
        type: 'input',
        name: 'api',
        message: 'What is your api path?',
      },
      {
        type: 'confirm',
        name: 'hasAppendIndex',
        message: 'Do you want inject models with your index?',
      },
      {
        type: 'confirm',
        name: 'hasAppendRoutesIndex',
        message: 'Do you want register Router with your routes/index?',
      },
    ],
    actions: function (data) {
      const pathDataModel =
        plop.getDestBasePath() +
        '/plop-templates/data/' +
        data.pageName +
        '.json'
      const dataModel = require(pathDataModel)
      data.columns = _.cloneDeep(dataModel)
      // show or hide, fixed left or right or none
      data.columnsStateMap = _.cloneDeep(dataModel).reduce((acc, cur) => {
        let colMap = {}
        if (typeof cur.show == 'boolean') {
          colMap.show = cur.show
        }
        if (typeof cur.fixed == 'string') {
          colMap.fixed = cur.fixed
        }
        if (Object.keys(colMap).length) {
          return {
            ...acc,
            [cur.dataIndex]: { ...colMap },
          }
        }
      }, {})
      data.columns = data.columns.map((item) => {
        if (typeof item.show == 'boolean') {
          delete item.show
        }
        return item
      })

      // xử lý data detail
      const dataModelDetail = dataModel.filter((col) => col.hideInForm !== true)
      let iRow = Math.floor(dataModelDetail.length / 2) + 1
      let iCol = 1
      /* dataForm = [
        { cols: [ { id:1, name: "col1" },{ id:2, name: "col2" } ] }
      ] */
      /* [
        { 0, 1} { 2, 3 } { 4 ,5 }
      ] */
      let dataRows = []
      for (let idx = 1; idx < iRow; idx++) {
        let cols = []
        for (let iCol = 1; iCol <= 2; iCol++) {
          let col = dataModel.shift()
          if (col) {
            cols.push(col)
          }
        }
        dataRows.push({ cols })
      }
      data.dataForm = dataRows
      let actions = []

      if (data.rootPathName) {
        actions = actions.concat([
          {
            type: 'add',
            path: 'src/routes/{{dashCase rootPathName}}/{{camelCase pageName}}/list/index.js',
            templateFile: 'plop-templates/views/index.js.hbs',
            skipIfExists: false,
            force: true,
          },
          {
            type: 'add',
            path: 'src/routes/{{dashCase rootPathName}}/index.js',
            templateFile: 'plop-templates/pathRoot/path.js.hbs',
            skipIfExists: true,
            // force: true
          },
          {
            type: 'add',
            path: 'src/routes/{{dashCase rootPathName}}/{{camelCase pageName}}/detail/index.js',
            templateFile: 'plop-templates/detail/index.js.hbs',
            skipIfExists: true,
            // force: true
          },
          // {
          //   type: 'append',
          //   path: 'src/routes/{{dashCase rootPathName}}/index.js',
          //   pattern: `/* PLOP_INJECT_IMPORT */`,
          //   template: `import {{pascalCase pageName}}List from './{{camelCase pageName}}/list';`,
          // },
          {
            type: 'append',
            path: 'src/routes/{{dashCase rootPathName}}/index.js',
            pattern: `{/* PLOP_INJECT_EXPORT */}`,
            template:
              "<Route path={`${match.url}/{{camelCase pageName}}`} component={asyncComponent(() => import('./{{camelCase pageName}}/list'))} exact={true} />",
          },
        ])
      } else {
        actions = actions.concat([
          {
            type: 'add',
            path: 'src/routes/{{camelCase pageName}}/list/index.js',
            templateFile: 'plop-templates/views/index.js.hbs',
            skipIfExists: false,
            // force: true
          },
          {
            type: 'add',
            path: 'src/routes/{{dashCase rootPathName}}/{{camelCase pageName}}/detail/index.js',
            templateFile: 'plop-templates/detail/index.js.hbs',
            skipIfExists: true,
            force: true,
          },
        ])
      }

      if (data.hasAppendRoutesIndex) {
        if (data.rootPathName) {
          actions = actions.concat([
            {
              type: 'append',
              path: 'src/routes/index.js',
              pattern: `/* PLOP_INJECT_IMPORT */`,
              template: `import {{pascalCase rootPathName}} from './{{camelCase rootPathName}}';`,
            },
            {
              type: 'append',
              path: 'src/routes/index.js',
              pattern: `{/* PLOP_INJECT_EXPORT */}`,
              template:
                '<Route path={`${match.url}{{dashCase rootPathName}}`} component={ {{pascalCase rootPathName}} } />',
            },
          ])
        } else {
          actions = actions.concat([
            {
              type: 'append',
              path: 'src/routes/index.js',
              pattern: `/* PLOP_INJECT_IMPORT */`,
              template: `import {{pascalCase pageName}}List from './{{camelCase pageName}}/list';`,
            },
            {
              type: 'append',
              path: 'src/routes/index.js',
              pattern: `{/* PLOP_INJECT_EXPORT */}`,
              template:
                '<Route path={`${match.url}/{{camelCase pageName}}`} component={ {{pascalCase pageName}}List } exact={true} />',
            },
          ])
        }
      }
      if (data.hasCreateModelAndService) {
        actions = actions.concat([
          {
            type: 'add',
            path: 'src/models/{{camelCase pageName}}.js',
            templateFile: 'plop-templates/models/models.js.hbs',
            skipIfExists: false,
            force: true,
          },
          {
            type: 'add',
            path: 'src/services/{{camelCase pageName}}.js',
            templateFile: 'plop-templates/services/services.js.hbs',
            skipIfExists: false,
            force: true,
          },
        ])
      }
      if (data.hasAppendIndex) {
        actions = actions.concat([
          {
            // Adds an index.js file if it does not already exist
            type: 'add',
            path: 'src/index.js',
            templateFile: 'plop-templates/app.js.hbs',
            // If index.js already exists in this location, skip this action
            skipIfExists: true,
          },
          {
            type: 'append',
            path: 'src/index.js',
            pattern: `/* PLOP_INJECT_IMPORT */`,
            template: `import model{{pascalCase pageName}} from './models/{{camelCase pageName}}';`,
          },
          {
            type: 'append',
            path: 'src/index.js',
            pattern: `/* PLOP_INJECT_EXPORT */`,
            template: `app.model(model{{pascalCase pageName}});`,
          },
          {
            // Adds an index.js file if it does not already exist
            type: 'add',
            path: 'src/routes.js',
            templateFile: 'plop-templates/routes.js.hbs',
            // If index.js already exists in this location, skip this action
            skipIfExists: true,
          },
          {
            type: 'append',
            path: 'src/routes.js',
            pattern: `/* PLOP_INJECT_LIST */`,
            template: `{ path: '/endow/{{camelCase pageName}}', name: '{{pascalCase pageName}}', component: React.lazy(() => import('./views/{{pascalCase pageName}}/List')), exact: true },`,
          },
          {
            type: 'append',
            path: 'src/routes.js',
            pattern: `/* PLOP_INJECT_CRUD */`,
            template: `{ path: '/endow/{{camelCase pageName}}/:id', name: '{{pascalCase pageName}} Crud', component: React.lazy(() => import('./views/{{pascalCase pageName}}/Crud')) },`,
          },
        ])
      }

      // i18n
      actions = actions.concat([
        {
          type: 'add',
          path: 'src/lngProvider/locales/en_US/{{camelCase pageName}}/{{camelCase pageName}}_en_US.json',
          templateFile: 'plop-templates/locales/en_US.json.hbs',
          skipIfExists: true,
        },
        {
          type: 'add',
          path: 'src/lngProvider/locales/vi_VN/{{camelCase pageName}}/{{camelCase pageName}}_vi_VN.json',
          templateFile: 'plop-templates/locales/vi_VN.json.hbs',
          skipIfExists: true,
        },
        {
          type: 'append',
          path: 'src/lngProvider/locales/vi_VN/index.js',
          pattern: `/* PLOP_INJECT_IMPORT */`,
          template: `import {{camelCase pageName}} from './{{camelCase pageName}}/{{camelCase pageName}}_vi_VN.json';`,
        },
        {
          type: 'append',
          path: 'src/lngProvider/locales/vi_VN/index.js',
          pattern: `/* PLOP_INJECT_EXPORT */`,
          template: `...{{camelCase pageName}},`,
        },
        {
          type: 'append',
          path: 'src/lngProvider/locales/en_US/index.js',
          pattern: `/* PLOP_INJECT_IMPORT */`,
          template: `import {{camelCase pageName}} from './{{camelCase pageName}}/{{camelCase pageName}}_en_US.json';`,
        },
        {
          type: 'append',
          path: 'src/lngProvider/locales/en_US/index.js',
          pattern: `/* PLOP_INJECT_EXPORT */`,
          template: `...{{camelCase pageName}},`,
        },
      ])
      return actions
    },
  })

  plop.setGenerator('crud', {
    description: 'Create a crud page',
    prompts: [
      {
        type: 'input',
        name: 'rootPathName',
        message: 'What is your root path name?',
      },
      {
        type: 'input',
        name: 'pageName',
        message: 'What is your page name?',
      },
      {
        type: 'input',
        name: 'api',
        message: 'What is your api crud path?',
      },
      {
        type: 'list',
        name: 'layout',
        message: 'What layout do you need?',
        choices: ['OneCol', 'TwoCol', 'ThreeCol'],
        filter(val) {
          return val.toLowerCase()
        },
      },
    ],
    actions: function (data) {
      console.log('data', data)
      // const fs = require('fs');
      const pathDataModel =
        plop.getDestBasePath() +
        '/plop-templates/data/' +
        data.pageName +
        '.json'
      let dataModel = require(pathDataModel)
      dataModel = dataModel.filter((col) => col.hideInForm !== true)
      const dataModelForLabel = _.cloneDeep(dataModel)
      let dataForm
      if (data.layout === 'threecol') {
        dataForm = dataModel.reduce((acc, col) => {
          for (let index = 0; index < acc.length; index++) {
            const element = acc[index]
            if (Object.keys(element).includes(col.formPattern.card)) {
              element[col.formPattern.card].push({
                [col.formPattern.row]: { [col.formPattern.col]: col },
              })
              return acc
            }
          }
          return [
            ...acc,
            {
              [col.formPattern.card]: [
                { [col.formPattern.row]: { [col.formPattern.col]: col } },
              ],
            },
          ]
        }, [])

        let iCard = 0
        for (let card of dataForm) {
          let dataRows = Object.values(card)[0]
          dataRows = dataRows.reduce((accRows, row) => {
            for (let idx = 0; idx < accRows.length; idx++) {
              const eRow = accRows[idx]
              if (Object.keys(eRow).includes(Object.keys(row)[0])) {
                eRow[Object.keys(row)[0]].push(Object.values(row)[0])
                return accRows
              }
            }
            return [
              ...accRows,
              { [Object.keys(row)[0]]: [Object.values(row)[0]] },
            ]
          }, [])
          let iRow = 0
          for (let row of dataRows) {
            let dataCols = Object.values(row)[0]

            let iCol = 0
            for (let col of dataCols) {
              dataCols[iCol] = {
                title: Object.keys(col)[0],
                col: transfromCol(Object.values(col)[0]),
              }
              iCol++
            }
            dataRows[iRow] = { title: Object.keys(row)[0], cols: dataCols }
            iRow++
          }
          dataForm[iCard] = { title: Object.keys(card)[0], rows: dataRows }
          iCard++
        }
        /* dataForm = [
          { title: "card1", rows: [
            { cols: [ { id:1, name: "col1" },{ id:2, name: "col2" },,{ id:3, name: "col3" } ] }
          ] }
        ] */
      } else if (data.layout === 'twocol') {
        let iRow = Math.floor(dataModel.length / 2) + 1
        let iCol = 1
        /* dataForm = [
          { cols: [ { id:1, name: "col1" },{ id:2, name: "col2" } ] }
        ] */
        /* [
          { 0, 1} { 2, 3 } { 4 ,5 }
        ] */
        let dataRows = []
        for (let idx = 1; idx < iRow; idx++) {
          let cols = []
          for (let iCol = 1; iCol <= 2; iCol++) {
            let col = dataModel.shift()
            if (col) {
              cols.push({ col: transfromCol(col) })
            }
          }
          dataRows.push({ cols })
        }
        dataForm = dataRows
      } else {
        dataForm = dataModel
      }

      let hasUpload = false
      const fieldLabels = dataModelForLabel.reduce((acc, cur) => {
        if (
          cur.valueType == 'avatar' ||
          cur.hasUpload ||
          cur.dataIndex == 'thumbnail' ||
          cur.dataIndex.includes('image')
        ) {
          hasUpload = true
        }
        return {
          ...acc,
          [cur.dataIndex]: cur.title,
        }
      }, {})
      data.hasUpload = hasUpload
      data.dataForm = dataForm
      data.fieldLabels = fieldLabels

      let actions = []
      if (data.layout === 'threecol') {
        if (data.rootPathName) {
          actions = actions.concat([
            {
              type: 'add',
              path: 'src/routes/{{dashCase rootPathName}}/{{pascalCase pageName}}/crud/index.js',
              templateFile: 'plop-templates/crud/three.js.hbs',
              skipIfExists: true,
            },
          ])
        } else {
          actions = actions.concat([
            {
              type: 'add',
              path: 'src/routes/{{pascalCase pageName}}/crud/index.js',
              templateFile: 'plop-templates/crud/three.js.hbs',
              skipIfExists: true,
            },
          ])
        }
      } else if (data.layout === 'twocol') {
        if (data.rootPathName) {
          actions = actions.concat([
            {
              type: 'add',
              path: 'src/routes/{{dashCase rootPathName}}/{{pascalCase pageName}}/crud/index.js',
              templateFile: 'plop-templates/crud/two.js.hbs',
              skipIfExists: true,
            },
          ])
        } else {
          actions = actions.concat([
            {
              type: 'add',
              path: 'src/routes/{{pascalCase pageName}}/crud/index.js',
              templateFile: 'plop-templates/crud/two.js.hbs',
              skipIfExists: true,
            },
          ])
        }
      } else {
        if (data.rootPathName) {
          actions = actions.concat([
            {
              type: 'add',
              path: 'src/routes/{{dashCase rootPathName}}/{{pascalCase pageName}}/crud/index.js',
              templateFile: 'plop-templates/crud/one.js.hbs',
              skipIfExists: true,
            },
          ])
        } else {
          actions = actions.concat([
            {
              type: 'add',
              path: 'src/routes/{{pascalCase pageName}}/crud/index.js',
              templateFile: 'plop-templates/crud/one.js.hbs',
              skipIfExists: true,
            },
          ])
        }
      }

      // add route
      if (data.rootPathName) {
        actions = actions.concat([
          {
            type: 'append',
            path: 'src/routes/{{dashCase rootPathName}}/index.js',
            pattern: `{/* PLOP_INJECT_EXPORT */}`,
            template:
              "<Route path={`${match.url}/{{camelCase pageName}}/:id`} component={asyncComponent(() => import('./{{camelCase pageName}}/crud'))} />",
          },
        ])
      } else {
        actions = actions.concat([
          {
            type: 'append',
            path: 'src/routes/index.js',
            pattern: `{/* PLOP_INJECT_EXPORT */}`,
            template:
              "<Route path={`${match.url}{{camelCase pageName}}/:id`} component={asyncComponent(() => import('./{{camelCase pageName}}/crud'))} />",
          },
        ])
      }
      return actions
    },
  })

  plop.setGenerator('select', {
    description: 'Create a select component',
    prompts: [
      {
        type: 'input',
        name: 'pageName',
        message: 'What is your page name?',
      },
      {
        type: 'input',
        name: 'key',
        message: 'What is your key field?',
      },
      {
        type: 'input',
        name: 'value',
        message: 'What is your value field?',
      },
    ],
    actions: [
      function (data) {
        console.log('data', data)
        // const fs = require('fs');
        return data
      },
      {
        type: 'add',
        path: 'src/components/Select/{{pascalCase pageName}}/index.js',
        templateFile: 'plop-templates/select/index.js.hbs',
        skipIfExists: true,
      },
    ],
  })

  plop.setGenerator('models', {
    description: 'Create a models and services component',
    prompts: [
      {
        type: 'input',
        name: 'pageName',
        message: 'What is your model and service name?',
      },
      {
        type: 'input',
        name: 'api',
        message: 'What is your api path?',
      },
      {
        type: 'confirm',
        name: 'hasAppendIndex',
        message: 'Do you want inject models with your index?',
      },
    ],
    actions: function (data) {
      var actions = [
        {
          type: 'add',
          path: 'src/models/{{camelCase pageName}}.js',
          templateFile: 'plop-templates/models/models.js.hbs',
          skipIfExists: true,
        },
        {
          type: 'add',
          path: 'src/services/{{camelCase pageName}}.js',
          templateFile: 'plop-templates/services/services.js.hbs',
          skipIfExists: true,
        },
      ]
      if (data.hasAppendIndex) {
        actions = actions.concat([
          {
            type: 'add',
            path: 'src/index.js',
            templateFile: 'plop-templates/app.js.hbs',
            skipIfExists: true,
          },
          {
            type: 'append',
            path: 'src/index.js',
            pattern: `/* PLOP_INJECT_IMPORT */`,
            template: `import model{{pascalCase pageName}} from './models/{{camelCase pageName}}';`,
            /* skip(data) {
              // console.log('skip -> data', data);
              if (!data.toppings.includes('mushroom')) {
                // Skip this action
                return 'Skipped replacing mushrooms';
              } else {
                // Continue with this action
                return;
              }
            },
            transform(fileContents, data) {
              console.log('transform -> fileContents', fileContents);
              return fileContents.replace(/partners/g, 'pepperoni');
            } */
          },
          {
            type: 'append',
            path: 'src/index.js',
            pattern: `/* PLOP_INJECT_EXPORT */`,
            template: `app.model(model{{pascalCase pageName}});`,
          },
        ])
      }
      return actions
    },
  })

  plop.setGenerator('selectlist', {
    description: 'Create a select-list component',
    prompts: [
      {
        type: 'input',
        name: 'pageName',
        message: 'What is your page name?',
      },
      {
        type: 'input',
        name: 'key',
        message: 'What is your key field?',
      },
      {
        type: 'input',
        name: 'value',
        message: 'What is your value field?',
      },
    ],
    actions: [
      function (data) {
        console.log('data', data)
        // const fs = require('fs');
        return data
      },
      {
        type: 'add',
        path: 'src/components/Select/{{pascalCase pageName}}/List{{pascalCase pageName}}/index.js',
        templateFile: 'plop-templates/select/List/index.js.hbs',
        skipIfExists: true,
      },
      {
        type: 'add',
        path: 'src/components/Select/{{pascalCase pageName}}//List{{pascalCase pageName}}//List{{pascalCase pageName}}.js',
        templateFile: 'plop-templates/select/List/List.js.hbs',
        skipIfExists: true,
      },
      /* {
        type: 'add',
        path: 'src/components/Select/{{pascalCase pageName}}//List{{pascalCase pageName}}//TableList.less',
        templateFile: 'plop-templates/select/List/TableList.less.hbs',
        skipIfExists: true,
      }, */
    ],
  })
}
