import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useTreeEditor } from '../auth/TreeEditorContext';

type TreeEditorUnlockDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function TreeEditorUnlockDialog({ open, onClose }: TreeEditorUnlockDialogProps) {
  const { unlock } = useTreeEditor();
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlock(passphrase.trim())) {
      setPassphrase('');
      setError(false);
      onClose();
      return;
    }
    setError(true);
  };

  const handleClose = () => {
    setPassphrase('');
    setError(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Layout editor</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your private phrase to unlock dragging, save layout, and lock controls. Visitors
            cannot edit the tree without it.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Private phrase"
            value={passphrase}
            onChange={(e) => {
              setPassphrase(e.target.value);
              setError(false);
            }}
            error={error}
            helperText={error ? 'Incorrect phrase' : ' '}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Unlock
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
