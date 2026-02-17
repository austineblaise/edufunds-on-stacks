;; edu-stipend-vault.clar
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TRANSFER-FAILED (err u101))

;; owner (deployer) can set registry principal
(define-data-var owner principal tx-sender)
(define-data-var registry principal tx-sender) ;; initialize to deployer; call set-registry to point to registry contract principal

(define-public (set-registry (p principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-AUTHORIZED)
    (var-set registry p)
    (ok true)
  )
)

;; release STX from this contract to recipient.
;; Only callable by the configured registry principal (i.e., the registry contract principal).
(define-public (release (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get registry)) ERR-NOT-AUTHORIZED)
    ;; attempt STX transfer from this contract to recipient
    (match (as-contract (stx-transfer? amount (as-contract tx-sender) recipient))
      ok (ok true)
      err ERR-TRANSFER-FAILED)
  )
)
