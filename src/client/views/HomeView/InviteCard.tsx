import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Flex,
  Heading,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../../AuthProvider";
import UserAvatar from "../../components/UserAvatar";
import useUserMetadata from "../../hooks/useUserMetadata";
import { useState } from "react";
import { getRelay } from "../../../common/services/relays";
import { useSigner } from "../../hooks/useSigner";
import { GameTypes } from "../../../common/const";
import { MODERATOR_PUBKEY, RELAY_URL } from "../../const";
import { buildDraftGameEvent } from "../../helpers/events";
import { Event } from "nostr-tools";
import { ensureConnected, waitForPub } from "../../../common/helpers/relays";

export default function InviteCard({
  pubkey,
  onCreateGame,
  ...props
}: { pubkey: string; onCreateGame?: (event: Event) => void } & CardProps) {
  const auth = useAuth();
  const signer = useSigner();
  const toast = useToast();
  const metadata = useUserMetadata(pubkey);
  const [message, setMessage] = useState("Play a chess game with me");
  const [loading, setLoading] = useState(false);

  const createGame = async () => {
    setLoading(true);
    try {
      const draft = buildDraftGameEvent(
        GameTypes.Chess,
        auth.pubkey,
        pubkey,
        message,
        MODERATOR_PUBKEY
      );
      const signed = await signer(draft);
      if (!signed) throw new Error("failed to sign");
      const relay = getRelay(RELAY_URL);
      await ensureConnected(relay);
      const pub = relay.publish(signed);
      await waitForPub(pub);
      toast({ status: "success", title: "Created game" });
      if (onCreateGame) onCreateGame(signed);
    } catch (e) {
      if (e instanceof Error) {
        toast({ status: "error", description: e.message });
      }
    }
    setLoading(false);
  };

  return (
    <Card {...props}>
      <CardHeader>
        <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
          <UserAvatar pubkey={pubkey} flexShrink={0} size="md" />

          <Box>
            <Heading size="sm" isTruncated>
              {metadata?.display_name || metadata?.name}
            </Heading>
            <Text>{metadata?.nip05}</Text>
          </Box>
        </Flex>
      </CardHeader>

      <CardBody py="0">
        <Textarea
          placeholder="Public message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </CardBody>

      <CardFooter flexWrap="wrap">
        <Button
          flex="1"
          variant="outline"
          colorScheme="purple"
          onClick={createGame}
          isLoading={loading}
        >
          Create game
        </Button>
      </CardFooter>
    </Card>
  );
}
