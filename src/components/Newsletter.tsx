import { FormEvent, useState } from "react";
import axios from "axios";
import styles from "@/styles/Newsletter.module.css";

const Newsletter = () => {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<
    "success" | "error" | "loading" | "idle"
  >("idle");
  const [responseMsg, setResponseMsg] = useState<string>("");
  const [statusCode, setStatusCode] = useState<number>();

  async function handleSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await axios.post("/api/subscribe", { email });

      setStatus("success");
      setStatusCode(response.status);
      setEmail("");
      setResponseMsg(response.data.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setStatus("error");
        setStatusCode(err.response?.status);
        setResponseMsg(err.response?.data.error);
      }
    }
  }

  return (
    <>
      <form onSubmit={handleSubscribe} className={styles.newsletterform}>
        <input
          className={`${
            statusCode === 400 ? "border-white" : "border-danger"
          }`}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
        />
        <button type="submit" className="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            className={`bi bi-send-fill ${
              status === "loading" ? styles.spinner : ""
            }`}
            viewBox="0 0 16 16"
          >
            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
          </svg>
        </button>
      </form>
      <div className="server-message pt-4 text-black">
        {status === "success" ? (
          <p className="text-success">{responseMsg}</p>
        ) : null}
        {status === "error" ? (
          <p className="text-danger">{responseMsg}</p>
        ) : null}
      </div>
    </>
  );
};

export default Newsletter;
