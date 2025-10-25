import { ConnectButton } from '@rainbow-me/rainbowkit'

export function MezoConnect() {
  return (
    <div className="text-center">
      <ConnectButton 
        label="Connect Wallet"
        showBalance={true}
        chainStatus="icon"
        accountStatus="avatar"
      />
      <p className="text-xs text-foreground/60 mt-2">
        Connect with Bitcoin wallets via Mezo Passport
      </p>
    </div>
  )
}
