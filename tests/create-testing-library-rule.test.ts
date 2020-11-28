import { createRuleTester } from './lib/test-utils';
import rule, { RULE_NAME } from './fake-rule';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Test Cases for Imports & Filename
    {
      code: `
      // case: nothing related to Testing Library at all
      import { shallow } from 'enzyme';
      
      const wrapper = shallow(<MyComponent />);
      `,
    },
    {
      code: `
      // case: nothing related to Testing Library at all (require version)
      const { shallow } = require('enzyme');
      
      const wrapper = shallow(<MyComponent />);
      `,
    },
    {
      code: `
      // case: render imported from other than custom module
      import { render } from '@somewhere/else'
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
    },
    {
      code: `
      // case: render imported from other than custom module (require version)
      const { render } = require('@somewhere/else')
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
    },
    {
      code: `
      // case: prevent import which should trigger an error since it's imported
      // from other than settings custom module
      import { foo } from 'report-me'
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
    },
    {
      code: `
      // case: prevent import which should trigger an error since it's imported
      // from other than settings custom module (require version)
      const { foo } = require('report-me')
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
    },
    {
      code: `
      // case: import module forced to be reported but not matching settings filename
      import { foo } from 'report-me'
    `,
      settings: {
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
    },
    {
      code: `
      // case: import module forced to be reported but not matching settings filename
      // (require version)
      const { foo } = require('report-me')
    `,
      settings: {
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
    },
    {
      code: `
      // case: import custom module forced to be reported without custom module setting
      import { foo } from 'custom-module-forced-report'
    `,
    },

    // Test Cases for all settings mixed
    {
      settings: {
        'testing-library/module': 'test-utils',
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
      code: `
      // case: matching custom settings partially - module but not filename
      import { render } from 'test-utils'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
      filename: 'MyComponent.testing-library.js',
      code: `
      // case: matching custom settings partially - filename but not module
      import { render } from 'other-utils'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
    },

    // Test Cases for presence/absence assertions
    // cases: asserts not related to presence/absence
    'expect(element).toBeDisabled()',
    'expect(element).toBeEnabled()',

    // cases: presence/absence matcher not related to assert
    'element.toBeInTheDocument()',
    'element.not.toBeInTheDocument()',

    // cases: weird scenarios to check guard against parent nodes
    'expect(element).not()',
    'expect(element).not()',

    // Test Cases for Queries and Aggressive Queries Reporting
    {
      code: `
      // case: custom method not matching "getBy*" variant pattern
      getSomeElement('button')
    `,
    },
    {
      code: `
      // case: custom method not matching "queryBy*" variant pattern
      querySomeElement('button')
    `,
    },
    {
      code: `
      // case: custom method not matching "findBy*" variant pattern
      findSomeElement('button')
    `,
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: built-in "getBy*" query not reported because custom module not imported
      import { render } from 'other-module'
      getByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: built-in "queryBy*" query not reported because custom module not imported
      import { render } from 'other-module'
      queryByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: built-in "findBy*" query not reported because custom module not imported
      import { render } from 'other-module'
      findByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
      code: `
      // case: built-in "getBy*" query not reported because custom filename doesn't match
      getByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
      code: `
      // case: built-in "queryBy*" query not reported because custom filename doesn't match
      queryByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
      code: `
      // case: built-in "findBy*" query not reported because custom filename doesn't match
      findByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        import * as tl from 'test-utils'
        const obj = { tl }
        obj.tl.waitFor(() => {})
      `,
    },
  ],
  invalid: [
    // Test Cases for Imports & Filename
    {
      code: `
      // case: import module forced to be reported
      import { foo } from 'report-me'
    `,
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      code: `
      // case: import module forced to be reported but from .spec.js named file
      import { foo } from 'report-me'
    `,
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },
    {
      filename: 'MyComponent.testing-library.js',
      code: `
      // case: import module forced to be reported with custom file name
      import { foo } from 'report-me'
    `,
      settings: {
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },
    {
      code: `
      // case: render imported from any module by default (aggressive reporting)
      import { render } from '@somewhere/else'
      import { somethingElse } from 'another-module'
      
      const utils = render();
      `,
      errors: [
        {
          line: 6,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from Testing Library module
      import { render } from '@testing-library/react'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      errors: [
        {
          line: 7,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from Testing Library module (require version)
      const { render } = require('@testing-library/react')
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      errors: [
        {
          line: 7,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from settings custom module
      import { render } from 'test-utils'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
      errors: [
        {
          line: 7,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from settings custom module (require version)
      const { render } = require('test-utils')
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
      errors: [
        {
          line: 7,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from Testing Library module with
      // settings custom module
      import { render } from '@testing-library/react'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
      errors: [
        {
          line: 8,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from Testing Library module with
      // settings custom module (require version)
      const { render } = require('@testing-library/react')
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
      errors: [
        {
          line: 8,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      settings: {
        'testing-library/module': 'custom-module-forced-report',
      },
      code: `
      // case: import custom module forced to be reported with custom module setting
      import { foo } from 'custom-module-forced-report'
    `,
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },

    // Test Cases for all settings mixed
    {
      settings: {
        'testing-library/module': 'test-utils',
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
      filename: 'MyComponent.testing-library.js',
      code: `
      // case: matching all custom settings
      import { render } from 'test-utils'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      errors: [{ line: 7, column: 21, messageId: 'fakeError' }],
    },

    // Test Cases for presence/absence assertions
    {
      code: `
      // case: presence matcher .toBeInTheDocument forced to be reported
      expect(element).toBeInTheDocument()
      `,
      errors: [{ line: 3, column: 7, messageId: 'presenceAssertError' }],
    },
    {
      code: `
      // case: absence matcher .not.toBeInTheDocument forced to be reported
      expect(element).not.toBeInTheDocument()
      `,
      errors: [{ line: 3, column: 7, messageId: 'absenceAssertError' }],
    },
    {
      code: `
      // case: presence matcher .not.toBeNull forced to be reported
      expect(element).not.toBeNull()
      `,
      errors: [{ line: 3, column: 7, messageId: 'presenceAssertError' }],
    },
    {
      code: `
      // case: absence matcher .toBeNull forced to be reported
      expect(element).toBeNull()
      `,
      errors: [{ line: 3, column: 7, messageId: 'absenceAssertError' }],
    },

    // Test Cases for Queries and Aggressive Queries Reporting
    {
      code: `
      // case: built-in "getBy*" query reported without import (aggressive reporting)
      getByRole('button')
    `,
      errors: [{ line: 3, column: 7, messageId: 'getByError' }],
    },
    {
      code: `
      // case: built-in "queryBy*" query reported without import (aggressive reporting)
      queryByRole('button')
    `,
      errors: [{ line: 3, column: 7, messageId: 'queryByError' }],
    },
    {
      code: `
      // case: built-in "findBy*" query reported without import (aggressive reporting)
      findByRole('button')
    `,
      errors: [{ line: 3, column: 7, messageId: 'findByError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      code: `
      // case: custom "getBy*" query reported without import (aggressive reporting)
      getByIcon('search')
    `,
      errors: [{ line: 3, column: 7, messageId: 'getByError' }],
    },
    {
      code: `
      // case: custom "queryBy*" query reported without import (aggressive reporting)
      queryByIcon('search')
    `,
      errors: [{ line: 3, column: 7, messageId: 'queryByError' }],
    },
    {
      code: `
      // case: custom "findBy*" query reported without import (aggressive reporting)
      findByIcon('search')
    `,
      errors: [{ line: 3, column: 7, messageId: 'findByError' }],
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: built-in "getBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/react'
      getByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'getByError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: built-in "queryBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/react'
      queryByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'queryByError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: built-in "findBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/react'
      findByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'findByError' }],
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: built-in "getBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      getByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'getByError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: built-in "queryBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      queryByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'queryByError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: built-in "queryBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      findByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'findByError' }],
    },

    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: custom "getBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/react'
      getByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'getByError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: custom "queryBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/framework'
      queryByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'queryByError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: custom "findBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/framework'
      findByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'findByError' }],
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: custom "getBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      getByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'getByError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: custom "queryBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      queryByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'queryByError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      // case: custom "findBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      findByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'findByError' }],
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        import * as tl from 'test-utils'
        tl.waitFor(() => {})
      `,
      errors: [{ line: 3, column: 9, messageId: 'fakeError' }],
    },
  ],
});
