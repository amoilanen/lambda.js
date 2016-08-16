import { Interpreter, Variable, Func, Application } from './lib/lambda'

describe('interpreter', () => {

  let interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
  });

  const test = (fixtures) =>
    fixtures.forEach(([expr, expected, comment = '']) => {
      it(`should interpret ${expr} ${comment}`, () => {
        expect(interpreter.eval(expr).toString()).toEqual(expected);
      });
    })

  describe('β-normal form: no further β-reduction is possible', () => {

    test([
      [
        new Variable('x'),
        'x',
        'variable'
      ],
      [
        new Func('x',
          new Variable('y')
        ),
        '(λx.y)', 'function'
      ],
      [
        new Application(
          new Variable('x'),
          new Variable('y')
        ),
        '(xy)', 'application'
      ]
    ]);
  });

  describe('one β-reduction until β-normal form', () => {

    test([
      [
        new Application(
          new Func('x',
            new Variable('y')
          ),
          new Variable('z')
        ),
        'y', 'body of the function is a free variable'
      ],
      [
        new Application(
          new Func('x',
            new Variable('x')
          ),
          new Variable('z')
        ),
        'z', 'identity function'
      ],
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('x'),
              new Variable('y')
            )
          ),
          new Variable('y')
        ),
        '(yy)', 'body of the function is an application'
      ],
      [
        new Application(
          new Func('x',
            new Func('y',
              new Application(
                new Variable('y'),
                new Variable('x')
              )
            )
          ),
          new Variable('z')
        ),
        '(λy.(yz))', 'body of the function is a function'
      ],
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('y'),
              new Variable('x')
            )
          ),
          new Func('t',
            new Variable('t')
          )
        ),
        '(y(λt.t))', 'argument is a function'
      ],
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('y'),
              new Variable('x')
            )
          ),
          new Application(
            new Variable('f'),
            new Variable('g')
          )
        ),
        '(y(fg))', 'argument is an application'
      ],
      [
        new Application(
          new Func('x',
            new Func('y',
              new Func('z',
                new Variable('x')
              )
            )
          ),
          new Func('t',
            new Variable('g')
          )
        ),
        '(λy.(λz.(λt.g)))', 'body is a deeply nested expression, argument a function'
      ],
      //(λx.z(λy.h(λz.x)))(λt.g) not just nested functions
    ]);
  });

  //TODO: Several β-reductions: (λx.xy)(λt.t) for example
  //TODO: Several pathes to do β-reduction
  //TODO: Implementation detail: left-most leaf expression is evaluated first?
  //TODO: Also store the history of evaluation
  //TODO: Variable name overshadows a variable from an enclosing context: α-reduction is needed to rename the variables
  //TODO: Implementation detail: α-reduction to avoid same variable name
  //TODO: Evaluate f(Yf):  Y-combinator applied to a function, should be a fixed point
});