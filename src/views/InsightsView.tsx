import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { getAllProfiles } from '../data/familyProfiles';
import { computeFamilyInsights, type GenerationInsights } from '../utils/familyInsights';

function StatCard({
  title,
  value,
  subtitle,
  detail,
}: {
  title: string;
  value: string;
  subtitle?: string;
  /** Shown when the card is expanded (e.g. sample size). */
  detail?: string;
}) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const expandable = Boolean(detail);

  const content = (
    <CardContent sx={{ py: 2, '&:last-child': { pb: expandable && expanded ? 1 : 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={600} sx={{ lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {expandable ? (
          expanded ? (
            <ExpandLessIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
          ) : (
            <ExpandMoreIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
          )
        ) : null}
      </Box>
      <Collapse in={expanded}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pt: 1 }}>
          {detail}
        </Typography>
      </Collapse>
    </CardContent>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        borderColor: 'divider',
      }}
    >
      {expandable ? (
        <CardActionArea onClick={() => setExpanded((e) => !e)} sx={{ height: '100%' }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}

function formatAvg(value: number | null): string {
  return value === null ? '—' : String(value);
}

function sampleDetail(n: number, label: string): string | undefined {
  if (n === 0) return undefined;
  return `Based on ${n} ${label} with recorded data`;
}

function GenerationSection({ gen }: { gen: GenerationInsights }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        {gen.label}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average age at first marriage"
            value={formatAvg(gen.averageAgeFirstMarriage)}
            detail={sampleDetail(gen.marriageSampleSize, 'relatives')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average age at first birth"
            value={formatAvg(gen.averageAgeFirstBirth)}
            detail={sampleDetail(gen.birthSampleSize, 'females')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Highest number of children"
            value={gen.highestChildren ? String(gen.highestChildren.count) : '—'}
            subtitle={gen.highestChildren?.name}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Lowest number of children"
            value={gen.lowestChildren ? String(gen.lowestChildren.count) : '—'}
            subtitle={gen.lowestChildren?.name}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <StatCard
            title="Average number of children"
            value={formatAvg(gen.averageChildren)}
            detail={sampleDetail(gen.childrenSampleSize, 'relatives')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export function InsightsView() {
  const insights = computeFamilyInsights(getAllProfiles());

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
        Insights
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 560 }}>
        Demographic quick facts by generation. Tap a stat to see how many relatives it is based on.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {insights.byGeneration.map((gen, index) => (
        <Box key={gen.generation}>
          <GenerationSection gen={gen} />
          {index < insights.byGeneration.length - 1 ? <Divider sx={{ mb: 3 }} /> : null}
        </Box>
      ))}
    </Box>
  );
}
