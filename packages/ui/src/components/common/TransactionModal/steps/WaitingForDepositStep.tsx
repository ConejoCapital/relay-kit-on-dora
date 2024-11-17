import { useEffect, useState, type FC } from 'react'
import {
  Anchor,
  Button,
  ChainIcon,
  Flex,
  Pill,
  Skeleton,
  Text
} from '../../../primitives/index.js'
import { LoadingSpinner } from '../../LoadingSpinner.js'
import { useRelayClient } from '../../../../hooks/index.js'
import getChainBlockExplorerUrl from '../../../../utils/getChainBlockExplorerUrl.js'
import { truncateAddress } from '../../../../utils/truncate.js'
import { type Token } from '../../../../types/index.js'
import type { RelayChain } from '@reservoir0x/relay-sdk'
import { CopyToClipBoard } from '../../CopyToClipBoard.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { QRCodeCanvas } from 'qrcode.react'
import { generateQrWalletDeeplink } from '../../../../utils/qrcode.js'

type WaitingForDepositStepProps = {
  fromToken?: Token
  toToken?: Token
  fromChain?: RelayChain
  fromAmountFormatted?: string
  toAmountFormatted?: string
  isFetchingQuote?: boolean
  recipientAddress?: string
  refundAddress?: string
  depositAddress?: string
}

export const WaitingForDepositStep: FC<WaitingForDepositStepProps> = ({
  fromToken,
  toToken,
  fromChain,
  fromAmountFormatted,
  toAmountFormatted,
  isFetchingQuote,
  recipientAddress,
  refundAddress,
  depositAddress
}) => {
  const [qrIcon, setQrIcon] = useState<string | undefined>()
  const relayClient = useRelayClient()
  const blockExplorerBase = getChainBlockExplorerUrl(
    fromChain?.id,
    relayClient?.chains
  )
  const qrcodeUrl = generateQrWalletDeeplink(
    fromChain?.vmType,
    fromAmountFormatted,
    depositAddress,
    fromChain?.id
  )

  // useEffect(() => {
  //   debugger
  //   if (fromChain?.icon?.light && fromToken?.logoURI) {
  //     setQrIcon(undefined)
  //     debugger
  //     generateQrIcon(fromChain.icon.light, fromToken.logoURI, 34)
  //       .then((image) => {
  //         setQrIcon(image)
  //       })
  //       .catch(() => {
  //         setQrIcon(undefined)
  //       })
  //   } else {
  //     setQrIcon(undefined)
  //   }
  // }, [fromToken, fromChain])

  return (
    <>
      <Flex direction="column" align="center" justify="between">
        <Flex align="center" css={{ gap: '1' }}>
          <Text style="body1" color="subtle">
            Send
          </Text>
          <Text style="h6">
            {isFetchingQuote ? (
              <Skeleton css={{ width: 50, height: 24 }} />
            ) : (
              fromAmountFormatted
            )}
          </Text>
          <Pill
            color="gray"
            css={{ display: 'flex', alignItems: 'center' }}
            radius="squared"
          >
            <img
              alt={fromToken?.name}
              src={fromToken?.logoURI}
              width={20}
              height={20}
              style={{
                borderRadius: 9999
              }}
            />
            <Text style="h6">{fromToken?.symbol}</Text>
          </Pill>
          <Text style="body1" color="subtle">
            to this address
          </Text>
        </Flex>
        <Flex css={{ gap: '1' }}>
          <Text style="body1" color="subtle">
            on
          </Text>
          <Text style="h6">{fromChain?.displayName} network</Text>
        </Flex>
      </Flex>
      {isFetchingQuote ? (
        <Skeleton css={{ width: 105, height: 105, margin: '0 auto' }} />
      ) : qrcodeUrl ? (
        <div
          style={{
            position: 'relative'
          }}
        >
          <Flex css={{ margin: '0 auto', width: 105, height: 105 }}>
            <Flex
              css={{
                position: 'absolute',
                width: 105,
                height: 105,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Flex css={{ position: 'relative' }}>
                <ChainIcon
                  chainId={fromChain?.id}
                  height={14}
                  width={14}
                  css={{
                    borderRadius: 4,
                    border: '1.5px solid white',
                    position: 'absolute',
                    bottom: 0,
                    right: 0
                  }}
                />
                <img
                  alt={fromToken?.name}
                  src={fromToken?.logoURI}
                  width={33}
                  height={33}
                  style={{
                    borderRadius: '100%',
                    border: '1.5px solid white'
                  }}
                />
              </Flex>
            </Flex>
            <QRCodeCanvas
              value={qrcodeUrl}
              width={105}
              height={105}
              level={'H'}
              imageSettings={{
                src: 'data:image/png;base64,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Y29tL2V4aWYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MTk0PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6VXNlckNvbW1lbnQ+U2NyZWVuc2hvdDwvZXhpZjpVc2VyQ29tbWVudD4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE4NjwvZXhpZjpQaXhlbFlEaW1lbnNpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjE0NDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+MTQ0PC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4Kmj5GzQAAACtJREFUWAnt0DEBAAAAwqD1T20ND4hAYcCAAQMGDBgwYMCAAQMGDBgwcDEwEakAAc3C1KAAAAAASUVORK5CYII=',
                height: 33,
                width: 33,
                excavate: true
              }}
              style={{ margin: '0 auto', width: 105, height: 105 }}
            />
          </Flex>
        </div>
      ) : null}
      <Pill
        color="gray"
        css={{ display: 'flex', alignItems: 'center', gap: '3', p: '3' }}
      >
        <Text style="subtitle2" ellipsify>
          {depositAddress}
        </Text>
        <CopyToClipBoard text={depositAddress ?? ''} />
        <Anchor
          href={`${blockExplorerBase}/address/${depositAddress}`}
          target="_blank"
          css={{ display: 'flex', alignItems: 'center', gap: '1' }}
        >
          <FontAwesomeIcon
            icon={faArrowUpRightFromSquare}
            style={{ width: 16, height: 16 }}
          />
        </Anchor>
      </Pill>
      <Pill color="amber" css={{ padding: '12px 32px' }} radius="squared">
        <Text color="warning" style="body3">
          Don't send {fromToken?.symbol} on any other network or it may be lost
        </Text>
      </Pill>
      <Flex
        direction="column"
        align="center"
        css={{
          '--borderColor': 'colors.subtle-border-color',
          border: '1px solid var(--borderColor)',
          borderRadius: 12,
          p: '3',
          gap: '3',
          width: '100%'
        }}
      >
        <Flex
          justify="between"
          align="center"
          css={{ width: '100%', gap: '4' }}
        >
          <Text style="subtitle2" color="subtle">
            You Get
          </Text>
          {isFetchingQuote ? (
            <Skeleton css={{ width: 80, height: 21 }} />
          ) : (
            <Flex
              align="center"
              css={{
                gap: '2'
              }}
            >
              <Text style="subtitle2">~ {toAmountFormatted}</Text>
              <Pill
                color="gray"
                css={{ display: 'flex', alignItems: 'center', gap: '1' }}
              >
                <img
                  alt={toToken?.name}
                  src={toToken?.logoURI}
                  width={20}
                  height={20}
                  style={{
                    borderRadius: 9999
                  }}
                />{' '}
                <Text style="subtitle2">{toToken?.symbol}</Text>
              </Pill>
            </Flex>
          )}
        </Flex>

        <Flex
          justify="between"
          align="center"
          css={{ width: '100%', gap: '4' }}
        >
          <Text style="subtitle2" color="subtle">
            Recipient Wallet
          </Text>
          <Text style="subtitle2">{truncateAddress(recipientAddress)}</Text>
        </Flex>
        <Flex
          justify="between"
          align="center"
          css={{ width: '100%', gap: '4' }}
        >
          <Text style="subtitle2" color="subtle">
            Refund Wallet
          </Text>
          <Text style="subtitle2">{truncateAddress(refundAddress)}</Text>
        </Flex>
      </Flex>
      <Button
        disabled={true}
        css={{
          color: 'button-disabled-color !important',
          mt: 8,
          justifyContent: 'center'
        }}
      >
        <LoadingSpinner
          css={{ height: 16, width: 16, fill: 'button-disabled-color' }}
        />
        Waiting for {fromAmountFormatted} {fromToken?.symbol}
      </Button>
    </>
  )
}
