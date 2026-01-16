tmux new -s session_name
tmux ls
tmux attach -t session_name

npm run dev -- --host 0.0.0.0 --port 8803

npm run dev -- --host 0.0.0.0 --port 18893 --strictPort
