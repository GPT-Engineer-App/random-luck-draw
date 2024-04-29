import React, { useState } from "react";
import { Box, Button, Container, FormControl, FormLabel, Input, List, ListItem, Text, VStack, useToast } from "@chakra-ui/react";
import { FaTrophy } from "react-icons/fa";
import { client } from "lib/crud";

const Index = () => {
  const [participants, setParticipants] = useState("");
  const [numberOfWinners, setNumberOfWinners] = useState("");
  const [winners, setWinners] = useState([]);
  const toast = useToast();

  const handleDraw = async () => {
    const parsedParticipants = parseParticipants(participants);
    const selectedWinners = drawWinners(parsedParticipants, parseInt(numberOfWinners));
    const timestamp = new Date().toISOString();

    // Save results to the database
    await client.set(`lottery:${timestamp}`, { winners: selectedWinners, timestamp });

    setWinners(selectedWinners);
    toast({
      title: "Draw complete",
      description: "Winners have been selected and saved.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const parseParticipants = (input) => {
    return input.split("\n").map((line) => {
      const [name, odds] = line.split(",");
      return { name, odds: parseFloat(odds) };
    });
  };

  const drawWinners = (participants, numWinners) => {
    const results = [];
    const totalOdds = participants.reduce((acc, participant) => acc + participant.odds, 0);
    for (let i = 0; i < numWinners; i++) {
      let randomPoint = Math.random() * totalOdds;
      for (const participant of participants) {
        if (randomPoint < participant.odds) {
          results.push(participant);
          break;
        }
        randomPoint -= participant.odds;
      }
    }
    return results;
  };

  return (
    <Container maxW="container.md">
      <VStack spacing={4} as="form" onSubmit={(e) => e.preventDefault()}>
        <FormControl isRequired>
          <FormLabel>Participants and Odds</FormLabel>
          <Input as="textarea" placeholder="Name1, Odds1\nName2, Odds2\n..." value={participants} onChange={(e) => setParticipants(e.target.value)} height="150px" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Number of Winners</FormLabel>
          <Input type="number" placeholder="Enter number of winners" value={numberOfWinners} onChange={(e) => setNumberOfWinners(e.target.value)} />
        </FormControl>
        <Button leftIcon={<FaTrophy />} colorScheme="blue" onClick={handleDraw}>
          Draw Winners
        </Button>
      </VStack>
      {winners.length > 0 && (
        <Box mt={6}>
          <Text fontSize="xl" mb={2}>
            Winners:
          </Text>
          <List spacing={3}>
            {winners.map((winner, index) => (
              <ListItem key={index}>
                <Text fontWeight="bold">{winner.name}</Text>
                <Text fontSize="sm">Odds: {winner.odds}</Text>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
};

export default Index;
