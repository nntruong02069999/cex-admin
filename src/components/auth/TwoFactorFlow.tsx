import { useState } from "react";
import Setup2FA from "./Setup2FA";
import VerifySetup2FA from "./VerifySetup2FA";
import Verify2FA from "./Verify2FA";

interface TwoFactorFlowProps {
  nextStep: string; // 'setup-2fa' or '2fa'
  onComplete: () => void;
  onCancel: () => void;
}

const TwoFactorFlow = ({
  nextStep,
  onComplete,
  onCancel,
}: TwoFactorFlowProps) => {
  const [currentStep] = useState<string>(nextStep);
  const [setupDone, setSetupDone] = useState<boolean>(false);
  const [secret, setSecret] = useState<string>("");

  // Handle the setup flow
  if (currentStep === "setup-2fa") {
    if (!setupDone) {
      return (
        <Setup2FA
          onComplete={(secretValue) => {
            setSecret(secretValue);
            setSetupDone(true);
          }}
        />
      );
    } else {
      return (
        <VerifySetup2FA
          secret={secret}
          onSuccess={onComplete}
          onCancel={() => setSetupDone(false)}
        />
      );
    }
  }

  // Handle verification during regular login
  if (currentStep === "2fa") {
    return <Verify2FA onSuccess={onComplete} onCancel={onCancel} />;
  }

  return null;
};

export default TwoFactorFlow;
