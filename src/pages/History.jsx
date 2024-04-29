import React, { useEffect, useState } from "react";
import { Box, Container, List, ListItem, Text } from "@chakra-ui/react";
import { client } from "lib/crud";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await client.getWithPrefix("lottery:");
      setHistory(data.map((item) => item.value));
    };
    fetchHistory();
  }, []);

  return (
    <Container maxW="container.md">
      <Text fontSize="2xl" mb={4}>
        Historical Results
      </Text>
      <List spacing={3}>
        {history.map((entry, index) => (
          <ListItem key={index}>
            <Text fontWeight="bold">Date: {new Date(entry.timestamp).toLocaleDateString()}</Text>
            {entry.winners.map((winner, idx) => (
              <Text key={idx}>
                {winner.name} (Odds: {winner.odds})
              </Text>
            ))}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default History;
