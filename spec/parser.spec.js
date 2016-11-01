import { Parser } from 'parser/parser'
import { Variable } from 'terms/variable'
import { Func } from 'terms/function'
import { Application } from 'terms/application'

describe('parser', () => {

  let parser;

  beforeEach(() => {
    parser = new Parser();
  });

  const test = (fixtures) =>
    fixtures.forEach(([expr, expected, comment = '']) => {
      it(`should parse ${expr} ${comment}`, () => {
        expect(parser.parse(expr)).toEqual(expected);
      });
    })

  it('should parse variable', () => {
    expect(parser.parse('x')).toEqual(new Variable('x'));
  });

  it('should parse function', () => {
    expect(parser.parse('λx.x')).toEqual(new Func('x', new Variable('x')));
  });

  it('should parse application', () => {
    expect(parser.parse('xy')).toEqual(new Application(new Variable('x'), new Variable('y')));
  });

  describe('parentheses', () => {
    test([
      ['(x)', new Variable('x')],
      ['(λx.x)', new Func('x', new Variable('x'))],
      ['(xy)', new Application(new Variable('x'), new Variable('y'))],
      ['(((x((y)))))', new Application(new Variable('x'), new Variable('y'))]
    ]);

    it('should throw an error if unmatched closing parentheses', () => {
      try {
        parser.parse('x)');
        throw 'Ignored unmatched closing parenthesis';
      } catch (e) {
        expect(e).toEqual('Unmatched closing parenthesis in \'x)\' at position 2');
      }
    });

    it('should throw an error if unmatched opening parentheses', () => {
      try {
        parser.parse('(x');
        throw 'Ignored missing closing parenthesis';
      } catch (e) {
        expect(e).toEqual('Missing closing parenthesis in \'(x\' at position 2');
      }
    });
  });

  describe('invalid expressions', () => {
    [
      ['', 'Empty expression is not expected at position 0'],
      ['λ', 'Incomplete function definition at position 1'],
      ['λx', 'Incomplete function definition at position 2'],
      ['λx.', 'Empty expression is not expected at position 3'],
      ['(λx.)z', 'Empty expression is not expected at position 4'],
      ['1', 'Unknown symbol \'1\' at position 0'],
      ['[x]', 'Unknown symbol \'[\' at position 0'],
      ['xy?', 'Unknown symbol \'?\' at position 2']
    ].forEach(([expr, errorMessage]) => {
      it(`should throw error when parsing ${expr}`, () => {
        try {
          parser.parse(expr);
          throw `Should have reported ${errorMessage}`;
        } catch (e) {
          expect(e).toEqual(errorMessage);
        }
      });
    });
  });

  describe('nested expressions', () => {
    test([
      ['((λx.x)z)',
        new Application(
          new Func('x', new Variable('x')),
          new Variable('z')
        )
      ],
      ['(λx.(λy.y))',
        new Func('x', new Func('y', new Variable('y')))
      ],
      ['((λx.(λy.y))z)',
        new Application(
          new Func('x', new Func('y', new Variable('y'))),
          new Variable('z')
        )
      ],
      ['(λx.(λy.(λz.((zy)x))))',
        new Func('x',
          new Func('y',
            new Func('z', 
              new Application(
                new Application(
                  new Variable('z'),
                  new Variable('y')
                ),
                new Variable('x')
              )
            )
          )
        )
      ],
      ['(λx.(xy)z)',
        new Func('x',
          new Application(
            new Application(
              new Variable('x'),
              new Variable('y')
            ),
            new Variable('z')
          )
        ),
        'assumes λ body to include all the terms until closing bracket'
      ],
      ['((λx.(xy))z)',
        new Application(
          new Func('x',
            new Application(
              new Variable('x'),
              new Variable('y')
            )
          ),
          new Variable('z')
        ),
        'assumes λ body to not include the terms after the closing bracket'
      ],
      ['(λx.((xy)z))',
        new Func('x',
          new Application(
            new Application(
              new Variable('x'),
              new Variable('y')
            ),
            new Variable('z')
          )
        ),
        'assumes λ body to include all the terms until closing bracket'
      ],
      ['(λx.x(λy.(yx)z))',
        new Func('x',
          new Application(
            new Variable('x'),
            new Func('y',
              new Application(
                new Application(
                  new Variable('y'),
                  new Variable('x')
                ),
                new Variable('z')
              )
            )
          )
        )
      ],
      ['(λf.(λx.f(xx))(λx.f(xx)))',
        new Func('f',
          new Application(
            new Func('x',
              new Application(
                new Variable('f'),
                new Application(
                  new Variable('x'),
                  new Variable('x')
                )
              )
            ),
            new Func('x',
              new Application(
                new Variable('f'),
                new Application(
                  new Variable('x'),
                  new Variable('x')
                )
              )
            )
          )
        ),
        'Y-combinator'
      ]
    ]);
  });

  describe('associativity', () => {

    /*
     * Applications associate to the right in order to simplify the used grammar/parser implementation
     */
    describe('applications', () => {
      test([
        ['yxz',
          new Application(
            new Variable('y'),
            new Application(
              new Variable('x'),
              new Variable('z')
            )
          ),
          'associates applications to the left without parentheses'
        ],
        ['(y(xz))',
          new Application(
            new Variable('y'),
            new Application(
              new Variable('x'),
              new Variable('z')
            )
          ),
          'follows parentheses for right association'
        ],
        ['((yx)z)',
          new Application(
            new Application(
              new Variable('y'),
              new Variable('x')
            ),
            new Variable('z')
          ),
          'follows parentheses for left association'
        ],
        ['(y(x)z)',
          new Application(
            new Variable('y'),
            new Application(
              new Variable('x'),
              new Variable('z')
            )
          ),
          'associates parentheses to the right respecting present parentheses'
        ],
        ['(y(xz)h)',
          new Application(
            new Variable('y'),
            new Application(
              new Application(
                new Variable('x'),
                new Variable('z')
              ),
              new Variable('h')
            )
          ),
          'associates parentheses to the left respecting present parentheses arround another application'
        ]
      ]);
    });

    describe('functions', () => {
      test([
        ['λx.λy.λz.f',
          new Func('x',
            new Func('y',
              new Func('z',
                new Variable('f')
              )
            )
          ),
          'associates applications to the right without parenthesis'
        ],
        ['(λx.(λy.(λz.f)))',
          new Func('x',
            new Func('y',
              new Func('z',
                new Variable('f')
              )
            )
          ),
          'follows parenthesis for right association'
        ]
      ]);
    });
  });

  //TODO: Shorthand for nested applications? (λx.(λy.(λz.zyx)))uvw
  //TODO: Shorthand for nested lambdas, for example λx.(λy.yx) is the same as λxy.yx

  //TODO: Be able to omit the parenthesis around a function body? (λx.x(λy.xy)) should be parsed
  //TODO: Be able to omit the parenthesis around the root term λx.x

  //TODO: Ability to use numbers as variable names?
  //TODO: Multiple symbol variables, always start with _ and end with _, for example λ_longx_._longx_
});