#include <bits/stdc++.h>
#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <graphics.h>
using namespace std;
bool solve(int src, int k, vector<pair<int, int>> g[], vector<bool> &vis)
{
  vis[src] = true; // vertex is visited now
  if (k <= 0)
    return true;
  for (auto x : g[src])
  {
    int u = x.first;
    int w = x.second;
    if (vis[u] == true) // if u vertex is already is visited
      continue;
    if (w >= k) // if current weight >=  path length
      return true;
    if (solve(u, k - w, g, vis)) // moving to next vertex;
      return true;
  }
  vis[src] = false; // backtracking, if no solution found and returning false.
  return false;
}
int main()
{
  int v, e, k;
  bool ans;
  cout << "Enter the number of vertex" << endl;
  cin >> v;
  cout << "Enter the number of edges" << endl;
  cin >> e;
  cout << "Enter the path length k" << endl;
  cin >> k;
  vector<pair<int, int>> g[v + 1];
  cout<<"Enter the two vertex and weight between them"<<endl;
  for (int i = 0; i < e; i++)
  {
    int x, y, w;
    cin >> x >> y >> w;
    g[x].push_back({y, w});
    g[y].push_back({x, w});
  }
  vector<bool> vis(v + 1, false); // for checking if that vertex is visited or not
  ans = solve(0, k, g, vis);
  cout << ans << endl; // assuming source vertex is 1
  int gd = DETECT, gm;
  initgraph(&gd, &gm, NULL);
  setbkcolor(BLUE);
   int right=10;
    int top=100;
  if (ans)
  {
   
    int j=0;
    for (int i = 0; i < v + 1; i++)
    {
      char str[1];
      sprintf(str, "%d", i);
      if(vis[i]==true){
        char text[3]={'-','>'};
        text[2]='\0';
             outtextxy(right, top, str);
        if(i!=v)     outtextxy(right+20, top, text);
             right +=40;
      }
    }
    char text2[]="end";
    outtextxy(right, top, text2);
  }
  else {
    string toprint="No path found";
    char text[14];
    for(int i=0;i<toprint.size();i++) text[i]=toprint[i];
outtextxy(right, top, text);
  }
  getch();
  return 0;
}