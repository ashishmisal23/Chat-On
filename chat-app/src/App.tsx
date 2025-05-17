import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material';
import { useChat } from './Component/useChat';

const dummyJwt = 'your.jwt.here';

export default function App() {
  const { messages, send } = useChat(dummyJwt);
  const [draft, setDraft] = useState('');

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        WebSocket Chat
      </Typography>

      <Box
        sx={{
          border: 1,
          borderColor: 'grey.300',
          borderRadius: 2,
          height: 400,
          overflowY: 'auto',
          p: 2,
          mb: 2,
        }}
      >
        <List dense>
          {messages.map(m => (
            <ListItem
              key={m.id}
              sx={{ justifyContent: m.mine ? 'flex-end' : 'flex-start' }}
            >
              <Box
                component="span"
                sx={{
                  bgcolor: m.mine ? 'primary.light' : 'grey.100',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">
                  <strong>{m.user}:</strong> {m.msg}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message…"
          value={draft}
          onChange={(e: any) => setDraft(e.target.value)}
          onKeyDown={(e: any) => {
            if (e.key === 'Enter') {
              send(draft);
              setDraft('');
            }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            send(draft);
            setDraft('');
          }}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
}
