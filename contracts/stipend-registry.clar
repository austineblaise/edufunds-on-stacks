;; edu-stipend-registry.clar
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NOT-FOUND    (err u101))
(define-constant ERR-ALREADY-WITHDRAWN (err u102))
(define-constant ERR-NOT-UNLOCKED (err u103))
(define-constant ERR-NON_POSITIVE (err u104))
(define-constant ERR-VAULT-FAILED (err u105))

(define-constant contract-owner tx-sender)
(define-data-var next-id uint u1)

(define-map assigners ((addr principal)) ((allowed bool)))

(define-map stipends
  ((id uint))
  (
    (recipient principal)
    (amount uint)
    (unlock uint)
    (withdrawn bool)
    (category (buff 64))
    (created-at uint)
    (assigned-by principal)
  )
)

;; admin: add/remove assigners
(define-public (add-assigner (p principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
    (map-set assigners ((addr p)) ((allowed true)))
    (ok true)
  )
)

(define-public (remove-assigner (p principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
    (map-delete assigners ((addr p)))
    (ok true)
  )
)

(define-read-only (is-assigner (caller principal))
  (or (is-eq caller contract-owner)
      (is-some (map-get? assigners ((addr caller))))
  )
)

(define-public (assign-stipend (recipient principal) (amount uint) (unlock uint) (category (buff 64)))
  (let ((caller tx-sender) (cur-time (as-max-len (get-block-info? 'time) u0))) ;; simplified current-time read
    (begin
      (asserts! (is-true (or (is-eq caller contract-owner) (is-some (map-get? assigners ((addr caller))))) ) ERR-NOT-AUTHORIZED)
      (asserts! (> amount u0) ERR-NON_POSITIVE)
      (let ((id (var-get next-id)))
        (map-set stipends
          ((id id))
          (
            (recipient recipient)
            (amount amount)
            (unlock unlock)
            (withdrawn false)
            (category category)
            (created-at cur-time)
            (assigned-by caller)
          ))
        (var-set next-id (+ id u1))
        (ok id)
      )
    )
  )
)

;; withdraw flow: validates caller is recipient and unlocked, then asks vault to release funds.
(define-public (withdraw-stipend (id uint) (vault-contract (buff 64)))
  (let ((maybe (map-get? stipends ((id id))))
        (cur-time (as-max-len (get-block-info? 'time) u0)))
    (match maybe
      nobody (err u101)
      some (as-tuple
        (let (
              (recipient (get some 'recipient))
              (amount (get some 'amount))
              (unlock (get some 'unlock))
              (withdrawn (get some 'withdrawn))
              (category (get some 'category))
              (created-at (get some 'created-at))
              (assigned-by (get some 'assigned-by))
             )
          (begin
            (asserts! (is-eq tx-sender recipient) ERR-NOT-AUTHORIZED)
            (asserts! (is-eq withdrawn false) ERR-ALREADY-WITHDRAWN)
            (asserts! (>= cur-time unlock) ERR-NOT-UNLOCKED)

            ;; call the vault contract to release the STX; vault-contract is the contract name (string) deployed under the same principal.
            ;; To call, we need to use the contract-call? form with a literal contract name in source. If you deploy the vault as
            ;; `edu-stipend-vault`, replace the next line with (contract-call? .edu-stipend-vault release recipient amount)
            ;; For safety in examples we require the vault name to be deployed under the same account and pass its name in code.
            (match (contract-call? .edu-stipend-vault release recipient amount)
              ok
                (begin
                  ;; mark withdrawn
                  (map-set stipends
                    ((id id))
                    (
                      (recipient recipient)
                      (amount amount)
                      (unlock unlock)
                      (withdrawn true)
                      (category category)
                      (created-at created-at)
                      (assigned-by assigned-by)
                    ))
                  (ok amount)
                )
              err (err u105)
            )
          )
        )
      )
    )
  )
)

(define-read-only (get-stipend (id uint))
  (match (map-get? stipends ((id id)))
    some some
    none (err u101))
)

(define-read-only (get-next-id) (ok (var-get next-id)))
