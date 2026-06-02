```
────────────────────────────────────────────────────────────────

SAFE DATA PLAY

Gr4ph1c4 should be able to pull data from real sources:

tables
CSV files
spreadsheets
SQL databases
JSON files
API responses later

But once the data enters Gr4ph1c4, the presenter is not editing the original source.

The presenter is editing a temporary visual working state.

That distinction matters.

The original source remains untouched.

The chart becomes playable.

The presenter can reshape it, test it, filter it, sort it, recolor it, resize it, highlight it, split it, merge it, restyle it, or completely rethink how it should be shown without risking the original data.

This is one of Gr4ph1c4's core promises:

Pull from the source.
Transform into Gr4ph1c4 format.
Play safely.
Rollback anytime.

The graph becomes a surface for exploration.

Not a trap.

────────────────────────────────────────────────────────────────

SOURCE SAFETY

A source is sacred.

If Gr4ph1c4 pulls from a database, table, spreadsheet, CSV file, or external dataset, the default behavior must be read-only.

The presenter may create views.

The presenter may create edits.

The presenter may create temporary transformations.

The presenter may create visual versions.

But the original source should not be overwritten unless the user explicitly asks for destructive export or write-back behavior.

By default:

source:<read-only>

This protects the presenter.

This protects the data.

This protects the room.

────────────────────────────────────────────────────────────────

TEMPORARY EDIT STATE

When Gr4ph1c4 receives data, it creates an editable working copy.

This working copy can be changed freely.

Example:

data sales_data
  from:<sql>
  connection:<local_sales_db>
  query:<"select month, revenue, region from sales">

chart sales_chart
  from:<sales_data>
  type:<bars>
  x:<month>
  y:<revenue>
  format:<projector>

The presenter can now play:

edit sales_chart
  type:<line>

resend sales_chart

edit sales_chart
  highlight:<March>

resend sales_chart

edit sales_chart
  filter:<region = "Houston">

resend sales_chart

None of these edits overwrite the SQL database.

They only affect the Gr4ph1c4 working state.

────────────────────────────────────────────────────────────────

ROLLBACK

Every imported dataset and every visual module should remember its first received state.

The first state is the anchor.

The presenter can experiment freely because rollback exists.

rollback sales_chart

The chart returns to the state it had when Gr4ph1c4 first received it.

rollback sales_data

The working copy of the data returns to the first imported version.

rollback screen

The full screen returns to its first composed state.

This makes Gr4ph1c4 error-proof by design.

Not because mistakes never happen.

Because mistakes are cheap.

────────────────────────────────────────────────────────────────

ENDLESS PLAY WITHOUT DAMAGE

Gr4ph1c4 should feel fun.

A presenter should be able to try ideas quickly:

What if this is a line chart?

What if this is bars?

What if we only show Houston?

What if we compare Houston against Dallas?

What if we highlight the failure month?

What if the older values fade?

What if the live values expand?

What if this becomes a dashboard?

What if this becomes a classroom slide?

What if this becomes a website section?

Each idea should be safe to try.

Edit.

Resend.

Observe.

Rollback.

Try again.

The presenter should not be punished for curiosity.

The system should follow the energy of the presentation.

────────────────────────────────────────────────────────────────

PLAYABLE VISUAL SURFACE

Gr4ph1c4 is not only a language for creating charts.

It is a playable surface for visual thought.

The data comes in.

The source remains safe.

The visual module becomes alive.

The presenter shapes it.

The room sees it.

If the presenter makes a mistake, they roll back.

If the presenter finds a better angle, they keep playing.

That is the point.

The graph is no longer a fragile artifact.

The graph becomes an instrument.

────────────────────────────────────────────────────────────────

EXAMPLE: SQL TO LIVE CHART

data city_sales
  from:<sql>
  connection:<sales_db>
  query:<"select city, month, revenue from monthly_sales">
  source:<read-only>

chart revenue_chart
  from:<city_sales>
  type:<bars>
  x:<month>
  y:<revenue>
  group:<city>
  format:<projector>
  labels:<large>
  live-view:<yes>

Now the presenter can safely command it:

edit revenue_chart
  type:<line>

resend revenue_chart

edit revenue_chart
  filter:<city = "Houston">

resend revenue_chart

edit revenue_chart
  highlight:<December>

resend revenue_chart

rollback revenue_chart

The chart returns to the first version.

The SQL database was never touched.

────────────────────────────────────────────────────────────────

EXAMPLE: TABLE TO CLASSROOM VISUAL

data student_scores
  from:<table>
  file:<scores.csv>
  source:<read-only>

chart score_growth
  from:<student_scores>
  type:<line>
  x:<week>
  y:<average_score>
  format:<classroom>
  labels:<large>

edit score_growth
  show:<top 5 students>

resend score_growth

edit score_growth
  type:<bars>

resend score_growth

rollback score_growth

The teacher can explore without fear.

The original file stays safe.

────────────────────────────────────────────────────────────────

THE SAFETY PROMISE

Gr4ph1c4 should make visual exploration feel safe enough to be bold.

The presenter should not be afraid to try.

The presenter should not be afraid to edit.

The presenter should not be afraid to resend.

The presenter should not be afraid to make a mistake in front of the room.

Because the system always has a way back.

The source is protected.

The first state is remembered.

The working state is playable.

Rollback is always close.

That is how Gr4ph1c4 becomes error-proof, fun, and alive.
```
