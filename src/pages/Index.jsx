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
    const parsedParticipants = participants;
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

  const handleFileChange = async (file) => {
    const text = await file.text();
    const participants = text.split("\n").map((line) => {
      const [name, odds] = line.split(",");
      return { name, odds: parseFloat(odds) };
    });
    setParticipants(participants);
  };

  const drawWinners = (participants, numWinners) => {
    const results = [];
    let totalOdds = participants.reduce((acc, participant) => acc + participant.odds, 0);
    const shuffledParticipants = participants.sort(() => 0.5 - Math.random());
    while (results.length < numWinners && shuffledParticipants.length > 0) {
      let randomPoint = Math.random() * totalOdds;
      for (let i = 0; i < shuffledParticipants.length; i++) {
        const participant = shuffledParticipants[i];
        if (randomPoint < participant.odds) {
          results.push(participant);
          shuffledParticipants.splice(i, 1);
          totalOdds -= participant.odds;
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
          <FormLabel>Upload Participants CSV</FormLabel>
          <Input type="file" accept=".csv" onChange={(e) => handleFileChange(e.target.files[0])} />
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
