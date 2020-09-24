var t = require('../index').simpleLisp;

var is = function (input, type) {
    return Object.prototype.toString.call(input) === '[object ' + type + ']';
};

// takes an AST and replaces type annotated nodes with raw values
var unannotate = function (input) {
    if (is(input, 'Array')) {
        if (input[0] === undefined) {
            return [];
        } else if (is(input[0], 'Array')) {
            return [unannotate(input[0])].concat(unannotate(input.slice(1)));
        } else {
            return unannotate(input[0]).concat(unannotate(input.slice(1)));
        }
    } else {
        return [input.value];
    }
};

describe('simpleLisp', function () {
    describe('parse', function () {
        it('should lex a single atom', function () {
            expect(t.parse('a').value).toEqual('a');
        });

        it('should lex an atom in a list', function () {
            expect(unannotate(t.parse('()'))).toEqual([]);
        });

        it('should lex multi atom list', function () {
            expect(unannotate(t.parse('(hi you)'))).toEqual(['hi', 'you']);
        });

        it('should lex list containing list', function () {
            expect(unannotate(t.parse('((x))'))).toEqual([['x']]);
        });

        it('should lex list containing list', function () {
            expect(unannotate(t.parse('(x (x))'))).toEqual(['x', ['x']]);
        });

        it('should lex list containing list', function () {
            expect(unannotate(t.parse('(x y)'))).toEqual(['x', 'y']);
        });

        it('should lex list containing list', function () {
            expect(unannotate(t.parse('(x (y) z)'))).toEqual(['x', ['y'], 'z']);
        });

        it('should lex list containing list', function () {
            expect(unannotate(t.parse('(x (y) (a b c))'))).toEqual(['x', ['y'], ['a', 'b', 'c']]);
        });

        describe('atoms', function () {
            it('should parse out numbers', function () {
                expect(unannotate(t.parse('(1 (a 2))'))).toEqual([1, ['a', 2]]);
            });
        });
    });

    describe('execute', function () {
        describe('lists', function () {
            it('should return empty list', function () {
                expect(t.execute('()')).toEqual([]);
            });

            it('should return list of strings', function () {
                expect(t.execute('("hi" "mary" "rose")')).toEqual(['hi', 'mary', 'rose']);
            });

            it('should return list of numbers', function () {
                expect(t.execute('(1 2 3)')).toEqual([1, 2, 3]);
            });

            it('should return list of numbers in strings as strings', function () {
                expect(t.execute('("1" "2" "3")')).toEqual(['1', '2', '3']);
            });
        });

        describe('atoms', function () {
            it('should return string atom', function () {
                expect(t.execute('"a"')).toEqual('a');
            });

            it('should return string with space atom', function () {
                expect(t.execute('"a b"')).toEqual('a b');
            });

            it('should return string with opening paren', function () {
                expect(t.execute('"(a"')).toEqual('(a');
            });

            it('should return string with closing paren', function () {
                expect(t.execute('")a"')).toEqual(')a');
            });

            it('should return string with parens', function () {
                expect(t.execute('"(a)"')).toEqual('(a)');
            });

            it('should return number atom', function () {
                expect(t.execute('123')).toEqual(123);
            });
        });

        describe('invocation', function () {
            it('should run print on an int', function () {
                expect(t.execute('(print 1)')).toEqual(1);
            });

            it('should return first element of list', function () {
                expect(t.execute('(car (1 2 3))')).toEqual(1);
            });

            it('should return first element of list', function () {
                expect(t.execute('(car (1))')).toEqual(1);
            });

            it('should return first element of list', function () {
                expect(t.execute('(car ())')).toEqual([]);
            });

            it('should return first element of list', function () {
                expect(t.execute('(car ((1 2 3) (1 2 3) (1 2 3)))')).toEqual([1, 2, 3]);
            });

            it('should return rest of list', function () {
                expect(t.execute('(cdr (1 2 3))')).toEqual([2, 3]);
            });

            it('should return rest of list', function () {
                expect(t.execute('(cdr (1))')).toEqual([]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons (1 2 3) (4 5 6))')).toEqual([1, 2, 3, 4, 5, 6]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons (1 2 3) (4))')).toEqual([1, 2, 3, 4]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons (1 2 3) ())')).toEqual([1, 2, 3]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons 1 ())')).toEqual([1]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons 1 (1))')).toEqual([1, 1]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons 1 (1 2 3))')).toEqual([1, 1, 2, 3]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons (1 2 3) (1 2 3) (1 2 3))')).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons 5 (1 2 3) (1 2 3))')).toEqual([5, 1, 2, 3, 1, 2, 3]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons (car (1 2 3)) (cdr (4 5 6)))')).toEqual([1, 5, 6]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cond ((< 2 3) "test"))')).toEqual('test');
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cond ((> 2 3) "test"))')).toEqual([]);
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cond ((> 2 3) "test")((< 3 5) "test1"))')).toEqual('test1');
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cond (t "test")((< 3 5) "test1"))')).toEqual('test');
            });

            it('should return concat of lists', function () {
                expect(t.execute('(cons () ())')).toEqual([]);
            });
        });

        describe('math', function () {
            it('should return sum atom', function () {
                expect(t.execute('(+ 2 2)')).toEqual(4);
            });

            it('should return sum atom', function () {
                expect(t.execute('(+ 21 35 12 7)')).toEqual(75);
            });

            it('should return multi atom', function () {
                expect(t.execute('(* 25 4 12)')).toEqual(1200);
            });

            it('should return difference atom', function () {
                expect(t.execute('(- 4 2)')).toEqual(2);
            });

            it('should return difference atom', function () {
                expect(t.execute('(- 4)')).toEqual(-4);
            });

            it('should return difference atom', function () {
                expect(t.execute('(- -5)')).toEqual(5);
            });

            it('should return sum', function () {
                expect(t.execute('(+ (* 3 5) (- 10 6))')).toEqual(19);
            });

            it('should return sum', function () {
                expect(t.execute('(+ (* 3 (+ (* 2 4) (+ 3 5))) (+ (- 10 7) 6))')).toEqual(57);
            });

            it('should return difference atom', function () {
                expect(t.execute('(- 1 2)')).toEqual(-1);
            });

            it('should return multi atom', function () {
                expect(t.execute('(* 3 3)')).toEqual(9);
            });

            it('should return multi atom', function () {
                expect(t.execute('(/ 9 3)')).toEqual(3);
            });

            it('should return true', function () {
                expect(t.execute('(= 2 2)')).toEqual(true);
            });

            it('should return true', function () {
                expect(t.execute('(< 2 3)')).toEqual(true);
            });

            it('should return false', function () {
                expect(t.execute('(> 2 3)')).toEqual(false);
            });

            it('should return true', function () {
                expect(t.execute('(>= 3 3)')).toEqual(true);
            });

            it('should return true', function () {
                expect(t.execute('(<= 5 5)')).toEqual(true);
            });

            it('should return true', function () {
                expect(t.execute('(!= 15 5)')).toEqual(true);
            });

            it('should return false', function () {
                expect(t.execute('(and t f)')).toEqual(false);
            });

            it('should return false', function () {
                expect(t.execute('(or t f)')).toEqual(true);
            });

            it('should return false', function () {
                expect(t.execute('(not t)')).toEqual(false);
            });

            it('should return false', function () {
                expect(t.execute('(not f)')).toEqual(true);
            });

            it('should return true', function () {
                expect(t.execute('(nil ())')).toEqual(true);
            });

            it('should return false', function () {
                expect(t.execute('(nil (1 2 3))')).toEqual(false);
            });

            it('should return false', function () {
                expect(t.execute('(nil 3)')).toEqual(false);
            });
        });

        describe('defun', function () {
            it('should return empty array and init new function', function () {
                expect(t.execute('(defun name(x y) (+ x y))')).toEqual([]);
            });

            it('should return res of new function', function () {
                expect(t.execute('(defun name(x y) (+ x y))(name 2 3)')).toEqual(5);
            });

            it('should return res of multi init new var', function () {
                expect(t.execute('(defun size(x) 3)(* 5 (size))')).toEqual(15);
            });

            it('should return res of multi init new var', function () {
                expect(t.execute('(defun pi() 3.14159)(defun radius() 10)(* (pi) (* (radius) (radius)))')).toEqual(
                    314.159
                );
            });

            it('should return res of new function', function () {
                expect(t.execute('(defun name(x y) (cons (car x) (cdr y)))(name (1 2 3) (4 5 6))')).toEqual([1, 5, 6]);
            });
        });

        describe('comments', function () {
            it('should return sum equal zero', function () {
                expect(
                    t.execute(`; (defun sum(x y)(* x y)) 
                          (defun sum(x y)(+ x y))
                          (sum 3 3)`)
                ).toEqual(6);
            });
        });

        describe('e2e', function () {
            it('should return sum equal zero', function () {
                expect(t.execute('(defun sum(lst)(cond ((nil lst)0)(t (+(car lst)(sum(cdr lst))))))(sum ())')).toEqual(
                    0
                );
            });

            it('should return sum equal one', function () {
                expect(t.execute('(defun sum(lst)(cond ((nil lst)0)(t (+(car lst)(sum(cdr lst))))))(sum (1))')).toEqual(
                    1
                );
            });

            it('should return sum equal six', function () {
                expect(
                    t.execute('(defun sum(lst)(cond ((nil lst)0)(t (+(car lst)(sum(cdr lst))))))(sum (1 2 3))')
                ).toEqual(6);
            });
        });
    });
});
