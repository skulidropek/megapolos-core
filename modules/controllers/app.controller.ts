expressApp.post('/apps/install', async (req, res) => {
  try {
    const input = req.body as AppInput;
    await installApp(req.user.id, input);
    res.send({ 'result': 'ok' });
  } catch (e) {
    console.error(e);
    res.status(400).send({
      error: e,
    });
  }
});

class AppController {
    
}