import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { getProfile, milestoneFields } from '../data/familyProfiles';

type ProfileSidebarProps = {
  personId: string;
  onClose: () => void;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function ProfileSidebar({ personId, onClose }: ProfileSidebarProps) {
  const profile = getProfile(personId);

  if (!profile) return null;

  const statusNote = profile.deceased ? 'Deceased' : 'Living';
  const milestones = milestoneFields(profile.milestones);

  return (
    <Box
      component="aside"
      sx={{
        width: 340,
        flexShrink: 0,
        height: '100%',
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Profile
        </Typography>
        <IconButton size="small" aria-label="Close profile" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {profile.name}
          {profile.deceased ? ' †' : ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {statusNote}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Basic information
        </Typography>
        <Field label="Sex" value={profile.sex === 'F' ? 'Female' : 'Male'} />
        <Field
          label="Age"
          value={profile.deceased ? `${profile.age} (at death)` : String(profile.age)}
        />
        <Field label="Birth year" value={String(profile.birthYear)} />
        <Field label="Marital status" value={profile.maritalStatus} />
        <Field label="Highest educational attainment" value={profile.education} />
        <Field label="Occupation" value={profile.occupation} />

        {milestones.length > 0 ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Life milestones
            </Typography>
            {milestones.map((row) => (
              <Field key={row.label} label={row.label} value={row.value} />
            ))}
          </>
        ) : null}
      </Box>
    </Box>
  );
}
