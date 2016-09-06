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
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('z'),
              new Func('y',
                new Application(
                  new Variable('h'),
                  new Func('z',
                    new Variable('x')
                  )
                )
              )
            )
          ),
          new Func('t',
            new Variable('g')
          )
        ),
        '(z(λy.(h(λz.(λt.g)))))', 'body contains nested applications, argument a function'
      ],
      [
        new Application(
          new Func('x',
            new Variable('x')
          ),
          new Func('x',
            new Variable('x')
          )
        ),
        '(λx.x)', 'identity applied to identity reduces to identity'
      ]
    ]);
  });

  describe('several potential β-reductions', () => {

    test([
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('x'),
              new Variable('y')
            )
          ),
          new Func('t',
            new Variable('t')
          )
        ),
        'y', 'several β-reductions'
      ],
      [
        new Application(
          new Func('x',
            new Variable('y')
          ),
          new Application(
            new Func('x',
              new Application(
                new Variable('x'),
                new Variable('x')
              )
            ),
            new Func('x',
              new Application(
                new Variable('x'),
                new Variable('x')
              )
            )
          )
        ),
        'y', 'several pathes to do β-reduction, leftmost redex is reduced first'
      ],
      [
        new Application(
          new Application(
            new Func('x',
              new Func('y',
                new Variable('x')
              )
            ),
            new Func('x',
              new Variable('x')
            )
          ),
          new Application(
            new Func('x',
              new Application(
                new Variable('x'),
                new Variable('x')
              )
            ),
            new Func('x',
              new Application(
                new Variable('x'),
                new Variable('x')
              )
            )
          )
        ),
        '(λx.x)', 'several pathes to do β-reduction, several β-reductions, leftmost redex is reduced first'
      ]
    ]);
  });

  describe('infinite loop detection', () => {

    it(`should detect`, () => {
      const expr = new Application(
        new Func('x',
          new Application(
            new Variable('x'),
            new Variable('x')
          )
        ),
        new Func('x',
          new Application(
            new Variable('x'),
            new Variable('x')
          )
        )
      );
      const errorMessage = 'Potential infinite loop detected while evaluating ((λx.(xx))(λx.(xx))), aborting...';

      expect(() => interpreter.eval(expr)).toThrowError(errorMessage);
    });
  });

  //TODO: (λx.(λy.x))((λx.xx)(λx.xx))(λx.x) does not reduce
  //TODO: (λx.(λy.x))(λx.x)(λx.xx) reduces in two reductions to (λx.x)
  //TODO: Implementation detail: left-most leaf expression is evaluated first?

  //TODO: Also store the history of evaluation
  //TODO: Variable name overshadows a variable from an enclosing context: α-reduction is needed to rename the variables
  //TODO: Implementation detail: α-reduction to avoid same variable name
  //TODO: Evaluate f(Yf) one reduction and Yf two reductions:  Y-combinator applied to a function, should reduce to the same term
});