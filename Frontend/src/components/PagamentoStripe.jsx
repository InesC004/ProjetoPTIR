// Exemplo de integração Stripe no Frontend (React)
// Instala: npm install @stripe/react-stripe-js @stripe/js

import { loadStripe } from "@stripe/js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export function PagamentoForm({ viagemId, clienteId, valor }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Passo 1: Criar Payment Intent no backend
      const intentResponse = await fetch(
        "http://localhost:8080/api/pagamentos/stripe/create-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            viagem_id: viagemId,
            cliente_id: clienteId,
            valor: valor,
            metodo: "cartao",
          }),
        },
      );

      const intentData = await intentResponse.json();

      if (!intentData.success) {
        throw new Error(intentData.message);
      }

      const clientSecret = intentData.clientSecret;
      const pagamentoId = intentData.pagamento._id;
      const paymentIntentId = intentData.pagamento.stripe_payment_intent_id;

      // Passo 2: Confirmar o pagamento com o cartão
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      // Passo 3: Confirmar no backend
      const confirmResponse = await fetch(
        "http://localhost:8080/api/pagamentos/stripe/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pagamento_id: pagamentoId,
            stripe_payment_intent_id: paymentIntentId,
          }),
        },
      );

      const confirmData = await confirmResponse.json();

      if (confirmData.success) {
        setSuccess(true);
        alert("Pagamento efetuado com sucesso!");
      } else {
        setError(confirmData.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <div className="stripe-card-container">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#fa755a",
              },
            },
          }}
        />
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Pagamento confirmado!</div>}

      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processando..." : `Pagar €${valor}`}
      </button>
    </form>
  );
}

// Usar no componente pai:
export function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <PagamentoForm
        viagemId="60d5ecb74bb2c2b001f1f1f1"
        clienteId="60d5ecb74bb2c2b001f1f1f2"
        valor={25.5}
      />
    </Elements>
  );
}
