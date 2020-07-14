# simple_lisp
A simple lisp machine for educational purposes.

Define a procedure that takes three numbers as arguments and returns the sum squares of two large ones.

```lisp
(defun sqSum(x y) (+ (* x x) (* y y)))
(defun max(x y) (cond ((< x y) y) (t x)))
(defun main(x y z) (sqSum (max x y) (max y z)))
(main 1 2 3)
```

; sqrt
```lisp
(defun average(x y) (/ (+ x y) 2))

(defun square(x)  (* x x))

(defun improve(guess x) (average guess (/ x guess)))

(defun abs(x) (cond ((< x 0) (- x)) ((= x 0) 0) ((> x 0) x)))

(defun good-enough?(guess x) (< (abs (- (square guess) x)) 0.001))

(defun sqrt-iter(guess x) (cond 
                            ((good-enough? guess x) guess)
                            (t (sqrt-iter (improve guess x) x))
                          )
)

(defun sqrt(x) (sqrt-iter 1 x))
(sqrt 9)
```

```lisp
;if
(defun if(predicate then else)  (cond 
                                    (predicate then)
                                    (t else)
                                )
 )
 (if (= 2 3) 0 5)
 (if (= 1 1) 0 5)
```

```lisp
(defun factorial(n) (cond 
                        ((= n 1) 1)
                        (t (* n (factorial (- n 1))))
                    )
)
(factorial 5)

(defun factorial(n) (fact-iter 1 1 n))
(defun fact-iter(product counter max-count) (cond 
                                                ((> counter max-count) product)
                                                (t (fact-iter (* counter product) (+ counter 1) max-count)))
)
(factorial 6)
```

how many ways can I exchange an amount of 1 dollar if there are coins of 50, 25, 10, 5 and 1 cent?
```lisp
(defun first-denomination(kinds-of-coins) (cond 
                                                ((= kinds-of-coins 1) 1)
                                                ((= kinds-of-coins 2) 5)
                                                ((= kinds-of-coins 3) 10)
                                                ((= kinds-of-coins 4) 25)
                                                ((= kinds-of-coins 5) 50))
)

(defun cc(amount kinds-of-coins) (cond ((= amount 0) 1)
                                       ((or (< amount 0) (= kinds-of-coins 0)) 0)
                                       (t (+ 
                                            (cc amount (- kinds-of-coins 1))
                                            (cc (- amount
                                                   (first-denomination kinds-of-coins)) kinds-of-coins)))
                                 )
)

(defun count-change(amount) (cc amount 5))
(count-change 100)
```

```lisp
(defun expt(b n) (cond 
                        ((= n 0) 1)
                        (t(* b (expt b (- n 1))))
                 )
)
(expt 2 3)

(defun expt-iter(b counter product) (cond 
                                        ((= counter 0) product)
                                        (t (expt-iter b (- counter 1) (* b product)))
                                     )
)

(defun expt(b n) (expt-iter b n 1))

(expt 2 3)
```

```lisp
(defun sum(term a next b) (cond 
                            ((> a b) 0)
                            (t (+ (term a)
                                  (sum term (next a) next b)))
                          )
)

(defun inc(n) (+ n 1))
(defun cube(x) (* x x x))

(defun sum-cubes(a b) (sum cube a inc b))
(sum-cubes 1 10)
```
