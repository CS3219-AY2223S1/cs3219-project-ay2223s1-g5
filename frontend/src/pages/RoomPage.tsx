import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { StyledButton } from "../components/StyledButton";

export const RoomPage = () => {
  return (
    <Grid container>
      <Grid item xs={12} sx={{ height: "10px", bgcolor: "primary.500" }}></Grid>
      <Grid item xs={12}>
        <Grid
          container
          item
          xs={12}
          sx={{ py: 2, px: 3, justifyContent: "space-between" }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Avatar
              sx={{
                width: "36px",
                height: "36px",
                bgcolor: "primary.A700",
              }}
            />
            <Avatar
              sx={{
                width: "36px",
                height: "36px",
                bgcolor: "primary.A700",
              }}
            />
          </Stack>
          <StyledButton label={"Leave Room"} sx={{ bgcolor: "red.500" }} />
        </Grid>
        <Divider />
        <Stack direction="row" spacing={2} sx={{ p: 3 }}>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Stack direction="column" spacing={3}>
                <Typography variant="h5" sx={{ textAlign: "center" }}>
                  Problem Title
                </Typography>
                <Divider />
                <Typography variant="body2" sx={{ textAlign: "justify" }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Praesent efficitur et massa at molestie. In pharetra facilisis
                  pulvinar. Ut rutrum imperdiet lectus, a pulvinar ligula porta
                  vel. Ut sollicitudin diam id metus tincidunt convallis. Etiam
                  scelerisque diam id condimentum finibus. Sed viverra sem
                  lorem, quis facilisis dui feugiat nec. Vivamus in accumsan
                  nisl. Nullam finibus finibus erat, ac consequat nulla. Ut et
                  metus at turpis sagittis efficitur. Nullam condimentum mauris
                  et imperdiet laoreet. Praesent dapibus, risus sed sagittis
                  tempus, elit ex rhoncus nibh, a congue elit orci ut urna.
                  Nullam nunc est, malesuada id magna ut, consectetur volutpat
                  massa. Donec dignissim orci nec fermentum ultricies.
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Example 1:
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "justify" }}>
                  Aliquam sodales, odio quis sagittis dignissim, nibh ipsum
                  tempus nibh, ut ullamcorper nisl quam et elit. Phasellus
                  sagittis libero nisl, vitae convallis nibh tincidunt quis.
                </Typography>
                <Accordion
                  sx={{
                    boxShadow: "none",
                    "& .MuiAccordionSummary-root": {
                      p: 0,
                    },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Hint 1</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <Typography variant="body2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ textAlign: "center" }}>
                Editor
              </Typography>
            </Paper>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};
