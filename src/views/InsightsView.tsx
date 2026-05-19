import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
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
      </CardContent>
    </Card>
  );
}

function formatAvg(value: number | null, sampleSize: number): string {
  if (value === null) return '—';
  return `${value} (${sampleSize} recorded)`;
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
            value={formatAvg(gen.averageAgeFirstMarriage, gen.marriageSampleSize)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average age at first birth"
            value={formatAvg(gen.averageAgeFirstBirth, gen.birthSampleSize)}
            subtitle="Females with recorded data"
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
            value={formatAvg(gen.averageChildren, gen.childrenSampleSize)}
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
        Demographic quick facts by generation, from profile and life-milestone data.
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
