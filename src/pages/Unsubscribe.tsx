// src/pages/Unsubscribe.tsx
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const email = params.get("email");
  const [done, setDone] = useState(false);

  const handleUnsubscribe = async () => {
    await supabase.from("subscribers").delete().eq("email", email);
    setDone(true);
  };

  if (done) return <div>You have been unsubscribed.</div>;

  return (
    <div>
      <h1>Unsubscribe</h1>
      <p>Are you sure you want to unsubscribe {email} from BearBites alerts?</p>
      <button onClick={handleUnsubscribe}>Unsubscribe</button>
    </div>
  );
}