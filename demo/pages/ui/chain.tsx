import { NextPage } from 'next'
import { LinkedWallet, SwapWidget } from '@reservoir0x/relay-kit-ui'
import { Layout } from 'components/Layout'
import {
  useDynamicContext,
  useDynamicEvents,
  useDynamicModals,
  useSwitchWallet,
  useUserWallets,
  Wallet
} from '@dynamic-labs/sdk-react-core'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AdaptedWallet,
  adaptViemWallet,
  RelayChain
} from '@reservoir0x/relay-sdk'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { adaptSolanaWallet } from '@reservoir0x/relay-solana-wallet-adapter'
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { useWalletFilter } from 'context/walletFilter'
import { isBitcoinWallet } from '@dynamic-labs/bitcoin'
import { adaptBitcoinWallet } from '@reservoir0x/relay-bitcoin-wallet-adapter'

const dynamicStaticAssetUrl =
  'https://iconic.dynamic-static-assets.com/icons/sprite.svg'

const ChainWidgetPage: NextPage = () => {
  const { setShowAuthFlow, primaryWallet } = useDynamicContext()
  const { setShowLinkNewWalletModal } = useDynamicModals()
  const { theme } = useTheme()

  useDynamicEvents('walletAdded', (newWallet) => {
    if (linkWalletPromise) {
      let walletLogoId =
        // @ts-ignore
        newWallet?.connector?.wallet?.brand?.spriteId ?? newWallet.key

      if (walletLogoId.includes('phantom')) {
        walletLogoId = 'phantom'
      }
      let walletChain = newWallet.chain.toLowerCase()
      let vmType: 'evm' | 'svm' | 'bvm' = 'evm'

      if (walletChain === 'sol') {
        vmType = 'svm'
      } else if (walletChain === 'btc') {
        vmType = 'bvm'
      }

      const linkedWallet = {
        address: newWallet.address,
        walletLogoUrl: `${dynamicStaticAssetUrl}#${walletLogoId}`,
        vmType
      }
      linkWalletPromise.resolve(linkedWallet)
      setLinkWalletPromise(undefined)
    }
  })
  const { setWalletFilter } = useWalletFilter()
  const _switchWallet = useSwitchWallet()
  const userWallets = useUserWallets()
  const wallets = useRef<Wallet<any>[]>()
  const switchWallet = useRef<(walletId: string) => Promise<void>>()
  const [wallet, setWallet] = useState<AdaptedWallet | undefined>()
  const [linkWalletPromise, setLinkWalletPromise] = useState<
    | {
        resolve: (value: LinkedWallet) => void
        reject: () => void
        params: { chain?: RelayChain; direction: 'to' | 'from' }
      }
    | undefined
  >()

  const linkedWallets = useMemo(() => {
    const _wallets = userWallets.reduce((linkedWallets, wallet) => {
      let walletLogoId =
        // @ts-ignore
        wallet?.connector?.wallet?.brand?.spriteId
      // @ts-ignore
      let walletIcon = wallet?.connector?.wallet?.icon

      let walletChain = wallet.chain.toLowerCase()

      let vmType: 'evm' | 'svm' | 'bvm' = 'evm'

      if (walletChain === 'sol') {
        vmType = 'svm'
      } else if (walletChain === 'btc') {
        vmType = 'bvm'
      }

      if (wallet.additionalAddresses.length > 0) {
        wallet.additionalAddresses.forEach((address) => {
          if (address.type === 'ordinals') {
            return
          }
          linkedWallets.push({
            address: address.address,
            walletLogoUrl: walletLogoId
              ? `${dynamicStaticAssetUrl}#${walletLogoId}`
              : walletIcon,
            vmType
          })
        })
      } else {
        linkedWallets.push({
          address: wallet.address,
          walletLogoUrl: walletLogoId
            ? `${dynamicStaticAssetUrl}#${walletLogoId}`
            : walletIcon,
          vmType
        })
      }

      return linkedWallets
    }, [] as LinkedWallet[])
    wallets.current = userWallets
    return _wallets
  }, [userWallets])

  useEffect(() => {
    switchWallet.current = _switchWallet
  }, [_switchWallet])

  useEffect(() => {
    const adaptWallet = async () => {
      try {
        if (primaryWallet !== null) {
          let adaptedWallet: AdaptedWallet | undefined
          if (isSolanaWallet(primaryWallet)) {
            const connection = await primaryWallet.getConnection()
            const signer = await primaryWallet.getSigner()

            adaptedWallet = adaptSolanaWallet(
              primaryWallet.address,
              792703809,
              connection,
              signer.signAndSendTransaction
            )
          } else if (isEthereumWallet(primaryWallet)) {
            const walletClient = await primaryWallet.getWalletClient()
            adaptedWallet = adaptViemWallet(walletClient)
          } else if (isBitcoinWallet(primaryWallet)) {
            const address =
              primaryWallet.additionalAddresses.find(
                (address) => address.type !== 'ordinals'
              )?.address ?? primaryWallet.address
            adaptedWallet = adaptBitcoinWallet(
              address,
              async (_address, _psbt, dynamicParams) => {
                try {
                  // Request the wallet to sign the PSBT
                  const response = await primaryWallet.signPsbt(dynamicParams)
                  if (!response) {
                    throw 'Missing psbt response'
                  }
                  return response.signedPsbt
                } catch (e) {
                  throw e
                }
              }
            )
          }
          setWallet(adaptedWallet)
        } else {
          setWallet(undefined)
        }
      } catch (e) {
        setWallet(undefined)
      }
    }
    adaptWallet()
  }, [primaryWallet, primaryWallet?.address])

  return (
    <Layout
      styles={{
        background: theme === 'light' ? 'rgba(245, 242, 255, 1)' : '#1c172b'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          paddingTop: 50
        }}
      >
        <SwapWidget
          lockChainId={8453}
          tokens={[
            {
              chainId: 8453,
              address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
              decimals: 6,
              name: 'USDC',
              symbol: 'USDC',
              logoURI: 'https://ethereum-optimism.github.io/data/USDC/logo.png'
            },
            {
              chainId: 8453,
              address: '0x0000000000000000000000000000000000000000',
              decimals: 18,
              name: 'ETH',
              symbol: 'ETH',
              logoURI: 'https://assets.relay.link/icons/1/light.png'
            }
          ]}
          defaultToToken={{
            chainId: 8453,
            address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
            decimals: 6,
            name: 'USDC',
            symbol: 'USDC',
            logoURI: 'https://ethereum-optimism.github.io/data/USDC/logo.png'
          }}
          multiWalletSupportEnabled={true}
          linkedWallets={linkedWallets}
          onLinkNewWallet={({ chain, direction }) => {
            if (linkWalletPromise) {
              linkWalletPromise.reject()
              setLinkWalletPromise(undefined)
            }
            if (chain?.vmType === 'evm') {
              setWalletFilter('EVM')
            } else if (chain?.id === 792703809) {
              setWalletFilter('SOL')
            } else if (chain?.id === 8253038) {
              setWalletFilter('BTC')
            } else {
              setWalletFilter(undefined)
            }
            const promise = new Promise<LinkedWallet>((resolve, reject) => {
              setLinkWalletPromise({
                resolve,
                reject,
                params: {
                  chain,
                  direction
                }
              })
            })
            setShowLinkNewWalletModal(true)
            return promise
          }}
          onSetPrimaryWallet={async (address: string) => {
            //In some cases there's a race condition between connecting the wallet and having it available to switch to so we need to poll for it
            const maxAttempts = 20
            let attemptCount = 0
            const timer = setInterval(async () => {
              attemptCount++
              const newPrimaryWallet = wallets.current?.find(
                (wallet) => wallet.address === address
              )
              if (attemptCount >= maxAttempts) {
                clearInterval(timer)
                return
              }
              if (!newPrimaryWallet || !switchWallet.current) {
                return
              }
              try {
                await switchWallet.current(newPrimaryWallet?.id)
                clearInterval(timer)
              } catch (e) {}
            }, 200)
          }}
          onConnectWallet={() => {
            setShowAuthFlow(true)
          }}
          onAnalyticEvent={(eventName, data) => {
            console.log('Analytic Event', eventName, data)
          }}
          onFromTokenChange={(token) =>
            console.log('From token changed to: ', token)
          }
          onToTokenChange={(token) =>
            console.log('To token changed to: ', token)
          }
          onSwapError={(e, data) => {
            console.log('onSwapError Triggered', e, data)
          }}
          onSwapSuccess={(data) => {
            console.log('onSwapSuccess Triggered', data)
          }}
        />
      </div>
    </Layout>
  )
}

export default ChainWidgetPage
