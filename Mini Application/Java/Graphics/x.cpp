#include <bits/stdc++.h>
#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <graphics.h>
using namespace std;

int main()
{
    string s = "acccaazzzzsdfewwwwffffws";
    int k = 3;
    int gd = DETECT, gm;
    initgraph(&gd, &gm, NULL);
    setbkcolor(BLUE);
    int n = s.length();         // length of given string
    unordered_map<char, int> m; // map is used to store frequency of characters
    for (int i = 0; i < n; i++)
    {
        m[s[i]]++; // increasing frequency of character by one
    }
    priority_queue<pair<char, int>> pq; // used to get lexicographically largest character
    for (auto i : m)
    { // pushing character and its frequency in pq.

        pq.push({i.first, i.second});
    }

    string ans = ""; // our answer string
    int x1 = 250, y1 = 40, x2 = 500, y2 = 40;
    int left = 60, top = 10, right = 100, bottom = 30; // left top riht botom
    while (!pq.empty())
    {
        char text1[] = {(pq.top().first)};

        char str[1];
        outtextxy(left + 18, top + 34, text1);

        top += 30;
        bottom += 30;
        sprintf(str, "%d", pq.top().second);
        rectangle(left, top, right, bottom);
        rectangle(left + 50, top, right + 50, bottom);
        outtextxy(right + 27, bottom - 15, str);

        y1 += 20;
        y2 += 20;

        char c1 = pq.top().first; // taking top element from pq
        int n1 = pq.top().second;
        pq.pop(); // popping it from pq.
         
        int len = min(k, n1); // finding how instance of chracters can be appended to our answer string as are given repeatelimit.
        for (int i = 0; i < len; i++)
        { // appending len instnace of characters to answer string
            ans += c1;
        }

        char c2;
        int n2 = 0;
        if (n1 - len > 0)
        {
            if (!pq.empty())
            {
                c2 = pq.top().first;  // again taking top elment from pq
                n2 = pq.top().second; // and its frequency
                pq.pop();             // popping the element from pq.
            }
            else
            { // if pq gets empty then we return ans string
                cout << ans << endl;
                return 0;
            }
            ans += c2; // just adding one c2 character to satisfy repeatlimit
        
            pq.push({c1, n1 - len}); // pushing remaining c1 element back to pq.
            if (n2 - 1 > 0)
            { // pushing remamining c2 element back to pq.
                pq.push({c2, n2 - 1});
            }
        }
         
        char toenter[ans.size()]={'a'};
        for(int b=0;b<ans.size();b++) toenter[b]=ans[b];
        outtextxy(left+100,top,toenter);
        cout<<toenter<<endl;
        line(0, bottom, getmaxx(), bottom);
    }
    cout << ans << endl;
    getch();

    return 0;
}